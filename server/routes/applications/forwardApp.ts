import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { getAppType } from '../../helpers/application/getAppType'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { validateForwardingApplication } from '../validate/validateForwardingApplication'

const PAGE_TITLE = 'Forward this application'

export default function forwardAppRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(`${URLS.APPLICATIONS}/:prisonerId/:applicationId/forward`, async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_FORWARD_APPLICATION',
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

      const filteredDepartments = (departments ?? [])
        .filter(dept => dept.id !== application.assignedGroup.id)
        .map(dept => ({
          value: dept.id,
          text: dept.name,
        }))

      await logSuccess()
      res.render(PATHS.APPLICATIONS.FORWARD, {
        application,
        applicationType,
        departments: filteredDepartments,
        textareaValue: '',
        title: PAGE_TITLE,
        errors: null,
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(`${URLS.APPLICATIONS}/:prisonerId/:applicationId/forward`, async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { forwardTo, forwardingReason } = req.body
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_APPLICATION_ASSIGNED_GROUP',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: { entityId: applicationId, applicationId, changes: [{ field: 'assignedGroup' }], ...extraDetails },
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
      const errors = validateForwardingApplication(forwardTo, forwardingReason)

      const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())

      const filteredDepartments = (departments ?? [])
        .filter(dept => dept.id !== application.assignedGroup.id)
        .map(dept => ({
          value: dept.id,
          text: dept.name,
        }))

      if (Object.keys(errors).length > 0) {
        await logFailure({ failureReason: 'Validation failed' })
        return res.render(PATHS.APPLICATIONS.FORWARD, {
          application,
          applicationType,
          departments: filteredDepartments,
          forwardTo,
          textareaValue: forwardingReason,
          title: PAGE_TITLE,
          errors,
        })
      }

      const forwardedDepartment = filteredDepartments.find(dept => dept.value === forwardTo)?.text

      await managingPrisonerAppsService.forwardApp(`${applicationId}`, forwardTo, user, { message: forwardingReason })

      const forwardedToQuery = forwardedDepartment ? `?forwardedTo=${encodeURIComponent(forwardedDepartment)}` : ''

      await logSuccess()
      return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}${forwardedToQuery}`)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
