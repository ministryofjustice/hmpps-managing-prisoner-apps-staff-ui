import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { ApplicationSearchPayload } from '../../@types/managingAppsApi'

import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'

import { extractQueryParamArray, removeFilterFromHref } from '../../utils/filters'
import { formatApplicationsToRows } from '../../utils/formatAppsToRows'
import { getApplicationType } from '../../utils/getApplicationType'
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

      const status =
        statusQuery === 'CLOSED'
          ? [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DECLINED]
          : [APPLICATION_STATUS.PENDING]

      const selectedGroups = extractQueryParamArray(req.query.group)
      const selectedTypes = extractQueryParamArray(req.query.type)
      const selectedPrisonerLabel = req.query.prisoner?.toString() || ''
      const selectedPrisonerId = selectedPrisonerLabel.match(/\(([^)]+)\)/)?.[1] || null

      const payload: ApplicationSearchPayload = {
        page,
        size: 10,
        status,
        types: selectedTypes,
        requestedBy: selectedPrisonerId,
        assignedGroups: selectedGroups,
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

      const paginationData = getPaginationData(page, totalRecords)

      let error = null
      if (selectedPrisonerId) {
        const foundPrisoner = prisonerDetails.find(
          prisoner => prisoner && prisoner[0]?.offenderNo === selectedPrisonerId,
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

      const groups = assignedGroups.map(group => ({
        value: group.id,
        text: `${group.name} (${group.count})`,
        checked: selectedGroups.includes(group.id),
      }))

      const appTypes = Object.entries(types)
        .map(([apiValue, count]) => {
          const matchingType = APPLICATION_TYPES.find(type => type.apiValue === apiValue)
          return matchingType
            ? {
                value: matchingType.apiValue,
                text: `${matchingType.name} (${count})`,
                checked: selectedTypes.includes(matchingType.apiValue),
              }
            : null
        })
        .filter(Boolean)

      const selectedFilters = {
        groups: assignedGroups
          .filter(group => selectedGroups.includes(group.id))
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
        status: statusQuery || APPLICATION_STATUS.PENDING,
        apps: formatApplicationsToRows(appsWithNames),
        groups,
        appTypes,
        selectedFilters,
        paginationData,
        page: payload.page,
        rawQuery: req.query,
        selectedPrisonerLabel,
        selectedPrisonerId,
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
          status: convertToTitleCase(application.status),
        },
      })
    }),
  )

  return router
}
