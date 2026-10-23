import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { AppResponsePayload } from '../../@types/managingAppsApi'

import { isOpenStatus } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
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
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_ACTION_AND_REPLY',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: { entityId: applicationId, applicationId, ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const validApplication = await getValidApplicationOrRedirect(req, res, managingPrisonerAppsService)
      if (!validApplication) {
        await logFailure({ failureReason: 'Application not valid' })
        return
      }
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

      await logSuccess()
      renderActionAndReplyPage(res, {
        application,
        applicationType,
        response: formattedResponse,
        isForwardable: departments?.length > 1,
        appLoggedDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
        todayDate: format(new Date(), 'd MMMM yyyy'),
        prisonerName: convertToTitleCase(`${application.requestedBy.lastName}, ${application.requestedBy.firstName}`),
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post('/applications/:prisonerId/:applicationId/reply', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { decision, reason, rejectedReason } = req.body
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'CREATE_APPLICATION_REPLY',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: {
            entityId: applicationId,
            applicationId,
            changes: [{ field: 'response' }, { field: 'status' }],
            ...extraDetails,
          },
        }),
    )

    await logAttempt()
    try {
      const application = await managingPrisonerAppsService.getPrisonerApp(`${prisonerId}`, `${applicationId}`, user)
      if (!application) {
        await logFailure({ failureReason: 'Application not found' })
        return res.redirect(URLS.APPLICATIONS)
      }

      const applicationType = await getAppType(
        managingPrisonerAppsService,
        user,
        application.applicationType.id.toString(),
      )
      const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())
      const errors = validateActionAndReply(decision, reason, rejectedReason)
      const [request] = application.requests ?? []

      if (Object.keys(errors).length > 0) {
        await logFailure({ failureReason: 'Validation failed' })
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

      await logSuccess()
      return res.redirect(`/applications/${prisonerId}/${applicationId}?applicationClosed=true`)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
