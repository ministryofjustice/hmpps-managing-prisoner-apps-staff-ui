import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { PHOTO_KEYS } from '../../constants/photos'

import AuditService from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'
import { getBackLink, resetSecondPhotoIfExists } from '../../helpers/photos'

const ERROR_MESSAGE = 'Select one'
const ERROR_SUMMARY = 'You need to select if you want to take another photo of the application.'

export default function anotherPhotoRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_ADD_ANOTHER_PHOTO, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_LOG_APPLICATION_ADD_ANOTHER_PHOTO',
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
      if (!applicationData?.loggingMethod) {
        await logFailure({ failureReason: 'Logging method not selected' })
        return res.redirect(URLS.LOG_METHOD)
      }

      resetSecondPhotoIfExists(req)

      await logSuccess()
      return res.render(PATHS.LOG_APPLICATION.ADD_ANOTHER_PHOTO, {
        title: 'Do you want to add another photo?',
        applicationType: applicationData.type.name,
        backLink: getBackLink(req),
        addAnotherPhoto: applicationData.addAnotherPhoto || null,
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(URLS.LOG_ADD_ANOTHER_PHOTO, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const { addAnotherPhoto } = req.body
    const { user } = res.locals
    const prisonerId = applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_APPLICATION_ADD_ANOTHER_PHOTO',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: { changes: [{ field: 'addAnotherPhoto' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      if (!applicationData?.loggingMethod) {
        await logFailure({ failureReason: 'Logging method not selected' })
        return res.redirect(URLS.LOG_METHOD)
      }

      if (!addAnotherPhoto) {
        await logFailure({ failureReason: 'Validation failed' })
        return res.render(PATHS.LOG_APPLICATION.ADD_ANOTHER_PHOTO, {
          title: 'Do you want to add another photo?',
          applicationType: applicationData.type?.name ?? '',
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_SUMMARY, href: '#addAnotherPhoto' }],
          addAnotherPhoto: applicationData.addAnotherPhoto || null,
          backLink: getBackLink(req),
        })
      }

      if (addAnotherPhoto === 'yes') {
        updateSessionData(req, { addAnotherPhoto, currentPhoto: PHOTO_KEYS.PHOTO_2 })
        await logSuccess()
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      updateSessionData(req, { addAnotherPhoto })
      await logSuccess()
      return res.redirect(URLS.LOG_ADDITIONAL_PHOTO_DETAILS)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
