import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { validateActionAndReply } from '../validate/validateActionAndReply'

export default function actionAndReplyRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications/:departmentName/:prisonerId/:applicationId/reply',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }
      await auditService.logPageView(Page.ACTION_AND_REPLY_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
      }

      return res.render(`pages/applications/action/index`, {
        application,
        departmentName,
      })
    }),
  )

  router.post(
    '/applications/:departmentName/:prisonerId/:applicationId/reply',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { selectAction, actionReplyReason } = req.body
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }

      const errors = validateActionAndReply(selectAction, actionReplyReason)

      if (Object.keys(errors).length > 0) {
        return res.render(`pages/applications/action/index`, {
          application,
          departmentName,
          selectedAction: selectAction,
          textareaValue: actionReplyReason,
          errors,
        })
      }

      return res.redirect(`/applications/${departmentName}/${prisonerId}/${applicationId}`)
    }),
  )

  return router
}
