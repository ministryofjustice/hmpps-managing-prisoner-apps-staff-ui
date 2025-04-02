import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { ApplicationSearchPayload } from '../../@types/managingAppsApi'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'

import { formatApplicationsToRows } from '../../utils/formatAppsToRows'
import { getApplicationType } from '../../utils/getApplicationType'

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
      const status = statusQuery === 'CLOSED' ? ['APPROVED', 'DECLINED'] : ['PENDING']

      const selectedDepartments: string[] = []
      if (req.query.department) {
        if (Array.isArray(req.query.department)) {
          selectedDepartments.push(...req.query.department.map(dep => String(dep)))
        } else {
          selectedDepartments.push(String(req.query.department))
        }
      }

      const selectedAppTypes: string[] = []
      if (req.query.type) {
        if (Array.isArray(req.query.type)) {
          selectedAppTypes.push(...req.query.type.map(type => String(type)))
        } else {
          selectedAppTypes.push(String(req.query.type))
        }
      }

      const payload: ApplicationSearchPayload = {
        page: 1,
        size: 10,
        status,
        types: selectedAppTypes,
        requestedBy: null,
        assignedGroups: selectedDepartments,
      }

      const [{ apps, types, assignedGroups }, prisonerDetails] = await Promise.all([
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

      const appsWithNames = apps.map((app, index) => {
        const prisoner = prisonerDetails[index]
        const prisonerName = prisoner ? `${prisoner[0]?.lastName}, ${prisoner[0]?.firstName}` : 'Undefined'
        return { ...app, prisonerName }
      })

      const appTypes = Object.entries(types)
        .map(([apiValue, count]) => {
          const matchingType = APPLICATION_TYPES.find(type => type.apiValue === apiValue)
          return matchingType
            ? {
                value: matchingType.apiValue,
                text: `${matchingType.name} (${count})`,
                checked: selectedAppTypes.includes(matchingType.apiValue),
              }
            : null
        })
        .filter(Boolean)

      await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const createDepartmentFilterHref = (departmentId: string) => {
        const newQuery = new URLSearchParams(req.query as Record<string, string | string[]>)

        newQuery.delete('department')

        const departments = req.query.department
        if (departments) {
          const departmentArray = Array.isArray(departments) ? departments : [departments as string]
          departmentArray
            .filter(dep => dep !== departmentId)
            .forEach(dep => newQuery.append('department', dep as string))
        }

        return `/applications?${newQuery.toString()}`
      }

      const createTypeFilterHref = (typeValue: string) => {
        const newQuery = new URLSearchParams(req.query as Record<string, string | string[]>)

        newQuery.delete('type')

        const { types: qTypes } = req.query
        if (qTypes) {
          const typeArray = Array.isArray(qTypes) ? qTypes : [qTypes]
          typeArray.filter(type => type !== typeValue).forEach(type => newQuery.append('type', type as string))
        }

        return `/applications?${newQuery.toString()}`
      }

      res.render('pages/applications/list/index', {
        status: statusQuery || 'PENDING',
        apps: formatApplicationsToRows(appsWithNames),
        departments: assignedGroups.map(group => ({
          value: group.id,
          text: `${group.name} (${group.count})`,
          checked: selectedDepartments.includes(group.id),
        })),
        appTypes,
        selectedFilters: {
          departments: assignedGroups
            .filter(group => selectedDepartments.includes(group.id))
            .map(group => ({
              href: createDepartmentFilterHref(group.id),
              text: group.name,
            })),
          appTypes: appTypes
            .filter(type => type.checked)
            .map(type => ({
              href: createTypeFilterHref(type.value),
              text: type.text,
            })),
        },
      })
    }),
  )

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
        },
      })
    }),
  )

  return router
}
