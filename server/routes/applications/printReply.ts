import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { isOpenStatus, APPLICATION_STATUS_LABELS } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { convertToTitleCase } from '../../utils/utils'

export default function printReplyRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get('/applications/:prisonerId/:applicationId/print-reply', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'PRINT_APPLICATION_REPLY',
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
      const isClosed = !isOpenStatus(application.status)
      const [request] = application.requests ?? []

      let response
      if (isClosed && request?.responseId) {
        const { decision, createdDate, reason } = await managingPrisonerAppsService.getResponse(
          `${prisonerId}`,
          `${applicationId}`,
          request.responseId,
          user,
        )

        response = {
          decision: convertToTitleCase(decision),
          actionedDate: format(createdDate, 'd MMMM yyyy'),
          reason: reason?.trim() || 'None',
          cellLocation: application.requestedBy.cellLocation,
        }
      }

      await logSuccess()
      res.render(PATHS.APPLICATIONS.PRINT_REPLY, {
        application,
        applicationType,
        applicationStatus: APPLICATION_STATUS_LABELS[application.status] ?? application.status,
        response,
        isClosed,
        isForwardable: departments?.length > 1,
        appLoggedDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
        todayDate: format(new Date(), 'd MMMM yyyy'),
        prisonerName: convertToTitleCase(`${application.requestedBy.lastName}, ${application.requestedBy.firstName}`),
        title: applicationType.name,
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
