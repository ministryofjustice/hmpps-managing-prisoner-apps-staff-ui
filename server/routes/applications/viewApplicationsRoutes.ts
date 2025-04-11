import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { ApplicationSearchPayload } from '../../@types/managingAppsApi'

import { APPLICATION_STATUS } from '../../constants/applicationStatus'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'

import { formatAppsToRows } from '../../utils/apps'
import { extractQueryParamArray, formatAppTypes, formatGroups, removeFilterFromHref } from '../../utils/filters'
import { getApplicationType } from '../../utils/getApplicationType'
import { getStatusesForQuery } from '../../utils/getStatusesForQuery'
import { getPaginationData } from '../../utils/pagination'
import { convertToTitleCase } from '../../utils/utils'

import logger from '../../../logger'

export default function viewApplicationRoutes({
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
    '/applications',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals

      const statusQuery = req.query.status?.toString().toUpperCase()
      const page = Number(req.query.page) || 1

      const status = getStatusesForQuery(statusQuery)

      const selectedFilters = (() => {
        const prisonerLabel = req.query.prisoner?.toString() || ''
        const prisonerId = prisonerLabel.match(/\(([^)]+)\)/)?.[1] || null
        return {
          groups: extractQueryParamArray(req.query.group),
          types: extractQueryParamArray(req.query.type),
          prisonerLabel,
          prisonerId,
        }
      })()

      const payload: ApplicationSearchPayload = {
        page,
        size: 10,
        status,
        types: selectedFilters.types,
        requestedBy: selectedFilters.prisonerId,
        assignedGroups: selectedFilters.groups,
      }

      const [{ apps, types, assignedGroups, totalRecords }, prisonerDetails] = await Promise.all([
        managingPrisonerAppsService.getApps(payload, user),
        managingPrisonerAppsService.getApps(payload, user).then(response =>
          Promise.all(
            response.apps.map(async app => {
              if (!app.requestedBy) return null
              return prisonService.getPrisonerByPrisonNumber(app.requestedBy, user)
            }),
          ),
        ),
      ])

      let error = null

      if (selectedFilters.prisonerId) {
        const foundPrisoner = prisonerDetails.find(
          prisoner => prisoner && prisoner[0]?.offenderNo === selectedFilters.prisonerId,
        )

        if (!foundPrisoner) {
          error = {
            message: 'Check your spelling or clear the search, then try again',
            summaryTitle: 'There is a problem',
          }
        }
      }

      const appsWithNames = apps.map((app, index) => {
        const prisoner = prisonerDetails[index]
        const prisonerName = prisoner ? `${prisoner[0]?.lastName}, ${prisoner[0]?.firstName}` : 'Undefined'
        return { ...app, prisonerName }
      })

      const appTypes = formatAppTypes(types, selectedFilters)
      const groups = formatGroups(assignedGroups, selectedFilters)

      const selectedFilterTags = {
        groups: assignedGroups
          .filter(group => selectedFilters.groups.includes(group.id))
          .map(group => ({
            href: removeFilterFromHref(req, 'group', group.id),
            text: group.name,
          })),
        types: appTypes
          .filter(type => type.checked)
          .map(type => ({
            href: removeFilterFromHref(req, 'type', type.value),
            text: type.text,
          })),
      }

      await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render('pages/applications/list/index', {
        apps: formatAppsToRows(appsWithNames),
        filters: {
          appTypes,
          groups,
          selectedFilters: selectedFilterTags,
          selectedPrisonerLabel: selectedFilters.prisonerLabel,
          selectedPrisonerId: selectedFilters.prisonerId,
        },
        pagination: getPaginationData(page, totalRecords),
        query: req.query,
        status: statusQuery || APPLICATION_STATUS.PENDING,
        error,
      })
    }),
  )

  router.get('/applications/search-prisoners', async (req: Request, res: Response): Promise<void> => {
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
    '/applications/:prisonerId/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      await auditService.logPageView(Page.VIEW_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications?error=unknown-type`)
      }

      return res.render(`pages/applications/view/${applicationType.value}`, {
        title: applicationType.name,
        application: {
          ...application,
          requestedDate: format(new Date(application.requestedDate), 'd MMMM yyyy'),
          status: application.status === 'PENDING' ? convertToTitleCase(application.status) : 'Closed',
        },
      })
    }),
  )

  return router
}
