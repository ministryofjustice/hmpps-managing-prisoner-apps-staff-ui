import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { isOpenStatus } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'

import { formatName } from '../../utils/formatters/formatName'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import {
  buildListQueryString,
  buildSelectedTags,
  checkSelectedFilters,
  formatFilterOptions,
  parseApplicationFilters,
  retainFiltersMiddleware,
} from '../../utils/http/filters'

import logger from '../../../logger'
import config from '../../config'
import { addPrisonerNames, buildApplicationsPayload } from '../../helpers/apps'
import { validatePrisonerFilter } from '../../helpers/prisoner'
import isApplicationOverdue from '../../helpers/application/isApplicationOverdue'
import { formatAppsToRows } from '../../utils/formatters/formatAppsToRows'
import { getPaginationData } from '../../utils/http/pagination'
import DocumentManagementService from '../../services/documentManagementService'
import { isChangeAppDetailsDisabledEstablishment } from '../../constants/enabledEstablishments'

export default function viewAppsRouter({
  auditService,
  managingPrisonerAppsService,
  prisonService,
  documentManagementService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  prisonService: PrisonService
  documentManagementService: DocumentManagementService
}): Router {
  const router = Router()

  router.get(URLS.APPLICATIONS, retainFiltersMiddleware, async (req: Request, res: Response) => {
    const { user } = res.locals
    const searchTerm = req.query.prisoner || req.session?.listFilters?.prisoner

    await auditLogged(
      'VIEW_APPLICATIONS',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(searchTerm || 'NONE'),
          subjectType: 'SEARCH_TERM',
          details: {
            queryParams: req.query,
            ...(what.endsWith('_SUCCESS') ? res.locals.auditDetails : {}),
            ...extraDetails,
          },
        }),
      async () => {
        const filters = parseApplicationFilters(req)
        const payload = buildApplicationsPayload(filters)

        const { apps, applicationTypes, assignedGroups, totalRecords, firstNightCenter } =
          await managingPrisonerAppsService.getApps(payload, user)

        const prisonerDetails = await Promise.all(
          apps.map(app =>
            app.requestedBy ? prisonService.getPrisonerByPrisonNumber(user.username, app.requestedBy) : null,
          ),
        )
        const error = validatePrisonerFilter(filters, prisonerDetails)

        const appsWithNames = addPrisonerNames(apps)
        const listQuery = buildListQueryString(req.query)
        const rows = await formatAppsToRows(managingPrisonerAppsService, user, appsWithNames, listQuery)

        const filterOptions = formatFilterOptions(applicationTypes, assignedGroups, filters, firstNightCenter)
        const selectedTags = buildSelectedTags(req, filters, filterOptions)
        const hasSelectedFilters = checkSelectedFilters(filters, selectedTags)

        res.locals.auditDetails = {
          queryParams: payload,
          results: {
            resultCount: apps.length,
            totalResultCount: totalRecords,
            returnedSubjectIds: [...new Set(apps.map(app => app.requestedBy).filter(Boolean))],
          },
        }

        res.render(PATHS.APPLICATIONS.LIST, {
          apps: rows,
          filters: {
            ...filterOptions,
            hasSelectedFilters,
            selectedFilters: selectedTags,
            selectedPrisonerLabel: filters.prisonerLabel,
            selectedPrisonerId: filters.prisonerId,
            selectedStatusValues: filters.selectedStatusValues,
            applicationTypeFilter: filters.applicationTypeFilter,
            oldestAppFirst: filters.oldestAppFirst,
          },
          pagination: getPaginationData(Number(req.query.page) || 1, totalRecords),
          query: req.query,
          status: filters.status,
          error,
        })
      },
    )
  })

  router.get(`${URLS.SEARCH_PRISONERS}`, async (req: Request, res: Response): Promise<void> => {
    const query = req.query.prisoner?.toString()
    const { user } = res.locals

    await auditLogged(
      'SEARCH_PRISONER',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        const auditWhat = what.endsWith('_SUCCESS') && !successful ? 'SEARCH_PRISONER_FAILURE' : what
        const details = {
          queryParams: req.query,
          ...(successful ? res.locals.auditDetails : {}),
          ...extraDetails,
          ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
        }
        await auditService.logAuditEvent({
          what: auditWhat,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(query || ''),
          subjectType: 'SEARCH_TERM',
          details,
        })
        if (what === 'SEARCH_PRISONER_SUCCESS' && successful) {
          await auditService.logAuditEvent({
            what: 'VIEW_PRISONER_SEARCH_RESULTS_SUCCESS',
            who: user.username,
            correlationId: String(req.id),
            subjectId: String(query || ''),
            subjectType: 'SEARCH_TERM',
            details: { queryParams: req.query, ...res.locals.auditDetails },
          })
        }
      },
      async () => {
        if (!query) {
          res.locals.auditDetails = { results: { resultCount: 0, returnedSubjectIds: [] } }
          res.json([])
          return
        }

        try {
          const prisoners = await managingPrisonerAppsService.searchPrisoners(query, user)

          res.locals.auditDetails = {
            results: {
              resultCount: prisoners.length,
              returnedSubjectIds: prisoners.map(prisoner => prisoner.prisonerId),
            },
          }

          const formattedResults = prisoners.map(prisoner => ({
            prisonerId: prisoner.prisonerId,
            label: `${formatName(prisoner.firstName, '', prisoner.lastName)} (${prisoner.prisonerId})`,
          }))

          res.json(formattedResults)
        } catch (error) {
          logger.error('Prisoner search failed', error)
          res.status(500).json([])
        }
      },
    )
  })

  router.get(`${URLS.APPLICATIONS}/:prisonerId/:applicationId`, async (req: Request, res: Response) => {
    const { user } = res.locals
    const forwardedTo = typeof req.query.forwardedTo === 'string' ? req.query.forwardedTo : undefined
    const applicationClosed = req.query.applicationClosed === 'true'
    const markedInProgress = req.query.markedInProgress === 'true'
    const { prisonerId, applicationId } = req.params

    await auditLogged(
      'VIEW_APPLICATION',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_APPLICATION_FAILURE' : what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: {
            entityId: applicationId,
            applicationId,
            ...(successful ? res.locals.auditDetails : {}),
            ...extraDetails,
            ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
          },
        })
      },
      async () => {
        const validApplication = await getValidApplicationOrRedirect(
          req,
          res,
          managingPrisonerAppsService,
          documentManagementService,
        )
        if (!validApplication) return
        const { application, applicationType, documents } = validApplication

        logger.info(`Application ${application.id} has ${application.files?.length || 0} files`)
        logger.info(`Fetched ${documents?.length || 0} documents`)
        logger.info(`Documents:`, JSON.stringify(documents, null, 2))

        const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())
        const isOverdue = isApplicationOverdue(application.createdDate, application.status)

        res.render(PATHS.APPLICATIONS.VIEW, {
          title: applicationType.name,
          applicationType: applicationType.name
            .replace(/[^\w\s]/g, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-'),
          application: {
            ...application,
            prisonerName: formatName(application.requestedByFirstName, '', application.requestedByLastName),
            createdDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
          },
          isClosed: !isOpenStatus(application.status),
          canChangeAppDetails:
            user.authSource !== 'nomis' || !isChangeAppDetailsDisabledEstablishment(user.activeCaseLoadId),
          dpsPrisonerUrl: config.dpsPrisoner,
          organisation:
            (
              application?.requests?.[0] as Partial<{ organisation?: string; company?: string }>
            )?.organisation?.trim() ||
            (application?.requests?.[0] as Partial<{ organisation?: string; company?: string }>)?.company?.trim() ||
            '',
          isGeneric: applicationType.genericType || applicationType.genericForm,
          isForwardable: departments?.length > 1,
          isOverdue,
          forwardedTo,
          applicationClosed,
          markedInProgress,
          documents,
          listQuery: buildListQueryString(req.query) || res.locals.listQuery,
        })
      },
    )
  })

  router.post(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/mark-in-progress`,
    async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
        'EDIT_APPLICATION_STATUS',
        async (what, extraDetails = {}) =>
          auditService.logAuditEvent({
            what,
            who: user.username,
            correlationId: String(req.id),
            subjectId: String(prisonerId),
            subjectType: 'PRISONER_ID',
            details: {
              entityId: applicationId,
              applicationId,
              changes: [{ field: 'status' }],
              ...extraDetails,
            },
          }),
      )

      await logAttempt()
      try {
        await managingPrisonerAppsService.updateAppToInProgress(`${prisonerId}`, `${applicationId}`, user)
        await logSuccess()
        return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}?markedInProgress=true`)
      } catch (error) {
        await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    },
  )

  return router
}
