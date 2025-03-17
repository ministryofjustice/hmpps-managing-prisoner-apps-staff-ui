import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'

export default function actionAndReplyRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()
  router.get(
    '/applications/:departmentName/:prisonerId/:applicationId/history',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }
      await auditService.logPageView(Page.HISTORY_APLICATION_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
      }

      return res.render(`pages/applications/history/index`, {
        application,
        departmentName,
        title: applicationType.name,
        h1: applicationType.name,
      })
    }),
  )

  return router
}
