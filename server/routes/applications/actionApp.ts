import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { AppResponsePayload } from '../../@types/managingAppsApi'

import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { convertToTitleCase } from '../../utils/utils'

import { getLegacyAppType } from '../../helpers/application/getLegacyAppType'
import { validateActionAndReply } from '../validate/validateActionAndReply'

export default function actionAppRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  const renderActionAndReplyPage = (res: Response, locals: Record<string, unknown>) =>
    res.render(PATHS.APPLICATIONS.ACTION_AND_REPLY, {
      title: 'Action and reply',
      ...locals,
    })

  router.get(
    '/applications/:prisonerId/:applicationId/reply',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.ACTION_AND_REPLY_PAGE,
      )

      const isAppPending = application.status === APPLICATION_STATUS.PENDING
      const [request] = application.requests ?? []

      let formattedResponse

      if (!isAppPending && request?.responseId) {
        const { decision, createdDate, reason } = await managingPrisonerAppsService.getResponse(
          prisonerId,
          applicationId,
          request.responseId,
          user,
        )

        formattedResponse = {
          decision: convertToTitleCase(decision),
          actionedDate: format(createdDate, 'd MMMM yyyy'),
          reason: reason?.trim() || 'None',
          cellLocation: application.requestedBy.cellLocation,
        }
      }

      return renderActionAndReplyPage(res, {
        application,
        applicationType,
        isAppPending,
        response: formattedResponse,
        appLoggedDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
        todayDate: format(new Date(), 'd MMMM yyyy'),
        prisonerName: convertToTitleCase(`${application.requestedBy.lastName}, ${application.requestedBy.firstName}`),
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

      if (!application) return res.redirect(URLS.APPLICATIONS)

      const applicationType = await getLegacyAppType(managingPrisonerAppsService, user, application.appType)
      const errors = validateActionAndReply(decision, reason)
      const isAppPending = application.status === APPLICATION_STATUS.PENDING
      const [request] = application.requests ?? []

      if (Object.keys(errors).length > 0) {
        return renderActionAndReplyPage(res, {
          application,
          applicationType,
          isAppPending,
          selectedAction: decision,
          textareaValue: reason,
          errors,
        })
      }

      const payload: AppResponsePayload = {
        reason,
        decision,
        appliesTo: [request.id],
      }

      await managingPrisonerAppsService.addResponse(prisonerId, applicationId, payload, user)

      return res.redirect(`/applications/${prisonerId}/${applicationId}/reply`)
    }),
  )

  return router
}
