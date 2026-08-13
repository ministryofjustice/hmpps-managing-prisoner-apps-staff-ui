import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { AppResponsePayload } from '../../@types/managingAppsApi'

import { isOpenStatus } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { convertToTitleCase } from '../../utils/utils'

import { getAppType } from '../../helpers/application/getAppType'
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

  router.get('/applications/:prisonerId/:applicationId/reply', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals

    const validApplication = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      Page.ACTION_AND_REPLY_PAGE,
    )
    if (!validApplication) return
    const { application, applicationType } = validApplication

    const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())

    const isAppOpen = isOpenStatus(application.status)
    const [request] = application.requests ?? []

    let formattedResponse

    if (!isAppOpen && request?.responseId) {
      const { decision, createdDate, reason } = await managingPrisonerAppsService.getResponse(
        `${prisonerId}`,
        `${applicationId}`,
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

    renderActionAndReplyPage(res, {
      application,
      applicationType,
      response: formattedResponse,
      isForwardable: departments?.length > 1,
      appLoggedDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
      todayDate: format(new Date(), 'd MMMM yyyy'),
      prisonerName: convertToTitleCase(`${application.requestedBy.lastName}, ${application.requestedBy.firstName}`),
    })
  })

  router.post('/applications/:prisonerId/:applicationId/reply', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { decision, reason, rejectedReason } = req.body
    const { user } = res.locals
    const application = await managingPrisonerAppsService.getPrisonerApp(`${prisonerId}`, `${applicationId}`, user)
    if (!application) return res.redirect(URLS.APPLICATIONS)

    const applicationType = await getAppType(
      managingPrisonerAppsService,
      user,
      application.applicationType.id.toString(),
    )
    const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())
    const errors = validateActionAndReply(decision, reason, rejectedReason)
    const [request] = application.requests ?? []

    if (Object.keys(errors).length > 0) {
      return renderActionAndReplyPage(res, {
        application,
        applicationType,
        selectedAction: decision,
        selectedRejectedReason: rejectedReason,
        textareaValue: reason,
        isForwardable: departments?.length > 1,
        errors,
      })
    }

    const payload: AppResponsePayload = {
      reason: decision === 'REJECTED' ? rejectedReason : reason,
      decision,
      appliesTo: [request.id],
    }

    await managingPrisonerAppsService.addResponse(`${prisonerId}`, `${applicationId}`, payload, user)

    return res.redirect(`/applications/${prisonerId}/${applicationId}?applicationClosed=true`)
  })

  return router
}
