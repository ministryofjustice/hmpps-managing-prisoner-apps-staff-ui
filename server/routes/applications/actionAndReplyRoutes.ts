import { Request, Response, Router } from 'express'
import { APPLICATION_STATUS } from '../../constants/applicationStatus'
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

      const isAppPending = application.status === APPLICATION_STATUS.PENDING

      return res.render(`pages/applications/action/index`, {
        application,
        departmentName,
        isAppPending,
        title: 'Action and reply',
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
      const isAppPending = application.status === APPLICATION_STATUS.PENDING

      if (Object.keys(errors).length > 0) {
        return res.render(`pages/applications/action/index`, {
          application,
          departmentName,
          isAppPending,
          selectedAction: selectAction,
          textareaValue: actionReplyReason,
          title: 'Action and reply',
          errors,
        })
      }

      return res.redirect(`/applications/${departmentName}/${prisonerId}/${applicationId}`)
    }),
  )

  return router
}
