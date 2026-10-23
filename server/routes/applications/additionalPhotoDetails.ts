import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'
import { getBackLink } from '../../helpers/photos'
import { validateTextField } from '../validate/validateTextField'

export default function additionalPhotoDetailsRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_ADDITIONAL_PHOTO_DETAILS, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_LOG_APPLICATION_ADDITIONAL_PHOTO_DETAILS',
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

      const photos = applicationData.photos ?? {}
      if (Object.keys(photos).length === 0) {
        await logFailure({ failureReason: 'No photos available' })
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      const additionalDetails = applicationData.photoAdditionalDetails ?? ''

      await logSuccess()
      return res.render(PATHS.LOG_APPLICATION.ADDITIONAL_PHOTO_DETAILS, {
        title: 'Enter additional details',
        applicationType: applicationData.type.name,
        photos: Object.values(photos),
        backLink: getBackLink(req),
        additionalDetails,
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(URLS.LOG_ADDITIONAL_PHOTO_DETAILS, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const { additionalDetails } = req.body
    const { user } = res.locals
    const prisonerId = applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_APPLICATION_ADDITIONAL_PHOTO_DETAILS',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: { changes: [{ field: 'photoAdditionalDetails' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      if (!applicationData?.loggingMethod) {
        await logFailure({ failureReason: 'Logging method not selected' })
        return res.redirect(URLS.LOG_METHOD)
      }

      const photos = applicationData.photos ?? {}

      if (Object.keys(photos).length === 0) {
        await logFailure({ failureReason: 'No photos available' })
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      const errors = validateTextField({ fieldValue: additionalDetails, fieldName: 'Details', isRequired: false })

      if (Object.keys(errors).length > 0) {
        await logFailure({ failureReason: 'Validation failed' })
        return res.render(PATHS.LOG_APPLICATION.ADDITIONAL_PHOTO_DETAILS, {
          title: 'Enter additional details',
          applicationType: applicationData.type.name,
          photos: Object.values(photos),
          backLink: getBackLink(req),
          additionalDetails,
          errors,
          errorSummary: [{ text: errors.Details.text, href: '#additionalDetails' }],
        })
      }

      updateSessionData(req, { photoAdditionalDetails: additionalDetails })

      await logSuccess()
      return res.redirect(URLS.LOG_CONFIRM_DETAILS)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
