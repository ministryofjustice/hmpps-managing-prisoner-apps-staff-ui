import { Request, Response, Router } from 'express'
import multer from 'multer'
import { csrfSync } from 'csrf-sync'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { PHOTO_KEYS } from '../../constants/photos'

import AuditService from '../../services/auditService'

import { updateSessionData } from '../../utils/http/session'
import { getBackLink, createPhotoFromFile, handlePhotoQueryParams, getPhotoLabel } from '../../helpers/photos'

const upload = multer({ storage: multer.memoryStorage() })

const { csrfSynchronisedProtection } = csrfSync({
  // eslint-disable-next-line no-underscore-dangle
  getTokenFromRequest: req => req.body._csrf,
})

export default function photoCaptureRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_PHOTO_CAPTURE, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const { retake, image } = req.query
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_LOG_APPLICATION_PHOTO_CAPTURE',
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

      handlePhotoQueryParams(req, retake as string, image as string)

      const currentPhoto = req.session.applicationData?.currentPhoto || PHOTO_KEYS.PHOTO_1

      await logSuccess()
      return res.render(PATHS.LOG_APPLICATION.PHOTO_CAPTURE, {
        title: 'Take a photo of the application',
        applicationType: applicationData.type.name,
        LOG_PHOTO_CAPTURE: URLS.LOG_PHOTO_CAPTURE,
        backLink: getBackLink(req),
        currentPhoto,
        photoLabel: getPhotoLabel(currentPhoto),
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(
    URLS.LOG_PHOTO_CAPTURE,
    upload.single('file'),
    csrfSynchronisedProtection,
    async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { file } = req
      const { user } = res.locals
      const prisonerId = applicationData?.prisonerId || 'NONE'
      const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
        'EDIT_LOG_APPLICATION_PHOTO_CAPTURE',
        async (what, extraDetails = {}) =>
          auditService.logAuditEvent({
            what,
            who: user.username,
            correlationId: String(req.id),
            subjectId: String(prisonerId),
            subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
            details: { changes: [{ field: 'photos' }], ...extraDetails },
          }),
      )

      await logAttempt()
      try {
        if (!file) {
          await logFailure({ failureReason: 'Photo file missing' })
          return res.redirect(URLS.LOG_PHOTO_CAPTURE)
        }

        const currentPhoto = applicationData.currentPhoto ?? PHOTO_KEYS.PHOTO_1
        const photos = applicationData.photos ?? {}

        photos[currentPhoto] = createPhotoFromFile(file, currentPhoto)

        updateSessionData(req, { photos, currentPhoto })

        await logSuccess()
        return res.redirect(URLS.LOG_CONFIRM_PHOTO_CAPTURE)
      } catch (error) {
        await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    },
  )

  router.get(`${URLS.LOG_VIEW_PHOTO}/:photoKey`, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const photoKey = req.params.photoKey as 'photo1' | 'photo2'
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_LOG_APPLICATION_PHOTO',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: applicationData?.prisonerId || 'NONE',
          subjectType: applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: { photoKey, ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const photo = applicationData?.photos?.[photoKey]

      if (!photo) {
        await logFailure({ failureReason: 'Photo not found' })
        res.status(404).render('pages/error', {
          message: 'Photo not found',
          status: 404,
        })
        return
      }

      res.setHeader('Content-Type', photo.mimetype)
      res.setHeader('Content-Disposition', `inline; filename="${photo.filename}"`)

      const buffer = Buffer.from(photo.buffer as string, 'base64')

      await logSuccess()
      res.send(buffer)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
