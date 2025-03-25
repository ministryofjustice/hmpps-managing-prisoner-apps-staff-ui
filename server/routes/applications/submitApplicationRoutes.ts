import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'

export default function submitApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/log/submit/:prisonerId/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationId, prisonerId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        res.redirect('/applications')
        return
      }

      await auditService.logPageView(Page.SUBMIT_APPLICATION_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        res.redirect('/applications?error=unknown-type')
        return
      }

      res.render(`pages/log-application/submit/${applicationType.value}`, {
        title: applicationType.name,
        application,
      })
    }),
  )

  return router
}
