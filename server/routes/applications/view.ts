import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'

import { formatAppsToRows } from '../../utils/apps'
import {
  buildSelectedTags,
  checkSelectedFilters,
  formatFilterOptions,
  parseApplicationFilters,
  retainFiltersMiddleware,
} from '../../utils/filters'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { getPaginationData } from '../../utils/pagination'
import { convertToTitleCase } from '../../utils/utils'

import logger from '../../../logger'
import config from '../../config'
import { addPrisonerNames, buildApplicationsPayload } from '../../helpers/apps'
import { validatePrisonerFilter } from '../../helpers/prisoner'

export default function viewAppsRouter({
  auditService,
  managingPrisonerAppsService,
  prisonService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  prisonService: PrisonService
}): Router {
  const router = Router()

  router.get(
    URLS.APPLICATIONS,
    retainFiltersMiddleware,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals

      const filters = parseApplicationFilters(req)
      const payload = buildApplicationsPayload(filters)

      const { apps, applicationTypes, assignedGroups, totalRecords, firstNightCenter } =
        await managingPrisonerAppsService.getApps(payload, user)

      const prisonerDetails = await Promise.all(
        apps.map(app => (app.requestedBy ? prisonService.getPrisonerByPrisonNumber(app.requestedBy, user) : null)),
      )
      const error = validatePrisonerFilter(filters, prisonerDetails)

      const appsWithNames = addPrisonerNames(apps)
      const rows = await formatAppsToRows(managingPrisonerAppsService, user, appsWithNames)

      const filterOptions = formatFilterOptions(applicationTypes, assignedGroups, filters, firstNightCenter)
      const selectedTags = buildSelectedTags(req, filters, filterOptions)
      const hasSelectedFilters = checkSelectedFilters(filters, selectedTags)

      await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.APPLICATIONS.LIST, {
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
    }),
  )

  router.get(`${URLS.SEARCH_PRISONERS}`, async (req: Request, res: Response): Promise<void> => {
    const query = req.query.prisoner?.toString()
    const { user } = res.locals

    if (!query) {
      res.json([])
      return
    }

    try {
      const prisoners = await managingPrisonerAppsService.searchPrisoners(query, user)

      const formattedResults = prisoners.map(prisoner => ({
        prisonerId: prisoner.prisonerId,
        label: `${prisoner.lastName}, ${prisoner.firstName} (${prisoner.prisonerId})`,
      }))

      res.json(formattedResults)
    } catch (error) {
      logger.error('Prisoner search failed', error)
      res.status(500).json([])
    }
  })

  router.get(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.VIEW_APPLICATION_PAGE,
      )

      return res.render(PATHS.APPLICATIONS.VIEW, {
        title: applicationType.name,
        applicationType: applicationType.name
          .replace(/[^\w\s]/g, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        application: {
          ...application,
          createdDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
          status: application.status === APPLICATION_STATUS.PENDING ? convertToTitleCase(application.status) : 'Closed',
        },
        isClosed: application.status !== APPLICATION_STATUS.PENDING,
        dpsPrisonerUrl: config.dpsPrisoner,
        organisation:
          (application?.requests?.[0] as Partial<{ organisation?: string; company?: string }>)?.organisation?.trim() ||
          (application?.requests?.[0] as Partial<{ organisation?: string; company?: string }>)?.company?.trim() ||
          '',
        isGeneric: applicationType.genericType || applicationType.genericForm,
      })
    }),
  )

  return router
}
