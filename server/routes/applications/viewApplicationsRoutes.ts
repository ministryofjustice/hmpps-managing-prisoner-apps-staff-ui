import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { ApplicationSearchPayload } from '../../@types/managingAppsApi'
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

      const payload: ApplicationSearchPayload = {
        page: 1,
        size: 5,
        status,
        types: [],
        requestedBy: null,
        assignedGroups: [],
      }

      const [{ apps }, prisonerDetails] = await Promise.all([
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

      res.render('pages/applications/list/index', {
        status: statusQuery || 'PENDING',
        apps: formatApplicationsToRows(appsWithNames),
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
