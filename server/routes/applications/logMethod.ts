import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'

import handleLoggingMethodSelection from '../../helpers/logMethod'

const ERROR_MESSAGE = 'Select one'
const ERROR_SUMMARY = 'You need to select a method to log the application'

type LoggingMethod = 'manual' | 'webcam'

export default function logMethodRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_METHOD, async (req: Request, res: Response) => {
    const { applicationData, isLoggingForSamePrisoner } = req.session
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_LOG_APPLICATION_METHOD',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: applicationData?.prisonerId || 'NONE',
          subjectType: applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: extraDetails,
        }),
    )

    await logAttempt()
    try {
      if (!applicationData?.department) {
        await logFailure({ failureReason: 'Department not selected' })
        return res.redirect(URLS.LOG_DEPARTMENT)
      }

      await logSuccess()
      return res.render(PATHS.LOG_APPLICATION.SELECT_METHOD, {
        title: 'Select method to log this application',
        errorMessage: null,
        errorSummary: null,
        applicationType: applicationData.type.name,
        isLoggingForSamePrisoner,
        selectedLogMethod: applicationData?.loggingMethod || null,
        prisonerName: isLoggingForSamePrisoner ? req.session.applicationData.prisonerName : null,
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(URLS.LOG_METHOD, async (req: Request, res: Response) => {
    const { loggingMethod } = req.body as { loggingMethod?: LoggingMethod }
    const { applicationData } = req.session
    const { user } = res.locals
    const prisonerId = applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_APPLICATION_METHOD',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: { changes: [{ field: 'loggingMethod' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      if (!applicationData?.department) {
        await logFailure({ failureReason: 'Department not selected' })
        return res.redirect(URLS.LOG_DEPARTMENT)
      }

      if (!loggingMethod) {
        await logFailure({ failureReason: 'Validation failed' })
        return res.render(PATHS.LOG_APPLICATION.SELECT_METHOD, {
          title: 'Select method to log this application',
          applicationType: applicationData.type?.name ?? '',
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_SUMMARY, href: '#loggingMethod' }],
          selectedLogMethod: loggingMethod || null,
        })
      }

      const { redirectUrl } = handleLoggingMethodSelection(req, loggingMethod)

      await logSuccess()
      return res.redirect(redirectUrl)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
