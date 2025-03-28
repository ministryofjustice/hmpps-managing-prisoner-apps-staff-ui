import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { ApplicationSearchPayload } from '../../@types/managingAppsApi'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { formatApplicationsToRows } from '../../utils/formatAppsToRows'
import { getApplicationType } from '../../utils/getApplicationType'

export default function viewApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications',
    asyncMiddleware(async (req: Request, res: Response) => {
      const status = req.query.status === 'CLOSED' ? 'CLOSED' : 'PENDING'

      const payload: ApplicationSearchPayload = {
        page: 1,
        size: 5,
        status: [status],
        types: [],
        requestedBy: null,
        assignedGroups: [],
      }

      const { user } = res.locals
      const { apps } = await managingPrisonerAppsService.getApps(payload, user)

      res.render('pages/applications/list/index', {
        status,
        apps: formatApplicationsToRows(apps),
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
