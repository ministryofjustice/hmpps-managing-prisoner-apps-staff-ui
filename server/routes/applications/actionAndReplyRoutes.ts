import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { AppResponsePayload } from '../../@types/managingAppsApi'
import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { convertToTitleCase } from '../../utils/utils'
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
    '/applications/:prisonerId/:applicationId/reply',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      await auditService.logPageView(Page.ACTION_AND_REPLY_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications?error=unknown-type`)
      }

      const isAppPending = application.status === APPLICATION_STATUS.PENDING

      let formattedResponse

      if (!isAppPending && application.requests?.[0]?.responseId) {
        const { decision, createdDate, createdBy, reason } = await managingPrisonerAppsService.getResponse(
          prisonerId,
          applicationId,
          application.requests[0].responseId,
          user,
        )

        formattedResponse = {
          decision: convertToTitleCase(decision),
          actionedDate: format(createdDate, 'd MMMM yyyy'),
          actionedBy: createdBy.fullName,
          reason: reason.trim() || 'None',
        }
      }

      return res.render(`pages/applications/action/index`, {
        application,
        applicationType,
        isAppPending,
        response: formattedResponse,
        title: 'Action and reply',
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/reply',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { decision, reason } = req.body
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      const applicationType = getApplicationType(application.appType)
      const errors = validateActionAndReply(decision, reason)
      const isAppPending = application.status === APPLICATION_STATUS.PENDING

      if (Object.keys(errors).length > 0) {
        return res.render(`pages/applications/action/index`, {
          application,
          applicationType,
          isAppPending,
          selectedAction: decision,
          textareaValue: reason,
          title: 'Action and reply',
          errors,
        })
      }

      const payload: AppResponsePayload = {
        reason,
        decision,
        appliesTo: [application.requests[0].id],
      }

      await managingPrisonerAppsService.addResponse(prisonerId, applicationId, payload, user)

      return res.redirect(`/applications/${prisonerId}/${applicationId}/reply`)
    }),
  )

  return router
}
