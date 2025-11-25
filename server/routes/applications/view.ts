import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { ApplicationSearchPayload } from '../../@types/managingAppsApi'

import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { formatAppTypesForFilters } from '../../helpers/filters/formatAppTypesForFilters'
import { formatGroupsForFilters } from '../../helpers/filters/formatGroupsForFilters'
import { formatPriorityForFilters } from '../../helpers/filters/formatPriorityForFilters'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'

import { formatAppsToRows } from '../../utils/apps'
import { checkSelectedFilters, extractQueryParamArray, removeFilterFromHref } from '../../utils/filters'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { getPaginationData } from '../../utils/pagination'
import { convertToTitleCase } from '../../utils/utils'

import logger from '../../../logger'
import config from '../../config'

type AllowedStatus = 'APPROVED' | 'DECLINED' | 'PENDING'
type UiStatus = AllowedStatus | 'CLOSED'

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
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const page = Number(req.query.page) || 1

      const rawStatus = extractQueryParamArray(req.query.status).map(s => s.toString().toUpperCase())
      const status: AllowedStatus[] = rawStatus.filter((s): s is AllowedStatus =>
        ['APPROVED', 'DECLINED', 'PENDING'].includes(s),
      )
      if (status.length === 0) status.push('PENDING')

      const selectedStatusValues: UiStatus[] = [...status]
      if (status.includes('APPROVED') || status.includes('DECLINED')) {
        selectedStatusValues.push('CLOSED')
      }

      const prisonerLabel = req.query.prisoner?.toString() || ''
      const prisonerId = prisonerLabel.match(/\(([^)]+)\)/)?.[1] || null

      const selectedFilters = {
        groups: extractQueryParamArray(req.query.group),
        types: extractQueryParamArray(req.query.type).map(type => type.toString()),
        priority: extractQueryParamArray(req.query.priority),
        prisonerLabel,
        prisonerId,
        status,
      }

      const payload: ApplicationSearchPayload = {
        page,
        size: 10,
        status,
        applicationTypes:
          selectedFilters.types.length > 0
            ? (selectedFilters.types.map(Number) as ApplicationSearchPayload['applicationTypes'])
            : undefined,
        requestedBy: selectedFilters.prisonerId || undefined,
        assignedGroups: selectedFilters.groups.length > 0 ? selectedFilters.groups : undefined,
        firstNightCenter: selectedFilters.priority.includes('first-night-centre') ? true : undefined,
      }

      const [{ apps, applicationTypes, assignedGroups, totalRecords, firstNightCenter }, prisonerDetails] =
        await Promise.all([
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
          prisoner => prisoner && prisoner?.offenderNo === selectedFilters.prisonerId,
        )
        if (!foundPrisoner) {
          error = {
            message: 'Check your spelling or clear the search, then try again',
            summaryTitle: 'There is a problem',
          }
        }
      }

      const appsWithNames = apps.map(app => {
        const prisonerName = `${app.requestedByLastName}, ${app.requestedByFirstName}`
        return { ...app, prisonerName }
      })

      const appTypes = formatAppTypesForFilters(applicationTypes, selectedFilters)
      const groups = formatGroupsForFilters(assignedGroups, selectedFilters)
      const priority = formatPriorityForFilters(selectedFilters, firstNightCenter)

      const selectedFilterTags = {
        status: status.map(s => ({
          href: removeFilterFromHref(req, 'status', s),
          text: s.charAt(0) + s.slice(1).toLowerCase(),
        })),
        priority: selectedFilters.priority.includes('first-night-centre')
          ? [
              {
                href: removeFilterFromHref(req, 'priority', 'first-night-centre'),
                text: 'First night or early days centre',
              },
            ]
          : [],
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
            text: type.text.replace(/\s\(\d+\)$/, ''),
          })),
      }

      const hasSelectedFilters = checkSelectedFilters(selectedFilters, selectedFilterTags)

      await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.APPLICATIONS.LIST, {
        apps: await formatAppsToRows(managingPrisonerAppsService, user, appsWithNames),
        filters: {
          appTypes,
          groups,
          priority,
          hasSelectedFilters,
          selectedFilters: selectedFilterTags,
          selectedPrisonerLabel: selectedFilters.prisonerLabel,
          selectedPrisonerId: selectedFilters.prisonerId,
          selectedStatusValues,
        },
        pagination: getPaginationData(page, totalRecords),
        query: req.query,
        status,
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
