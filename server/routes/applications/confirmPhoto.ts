import { Request, Response, Router } from 'express'
import multer from 'multer'
import { csrfSync } from 'csrf-sync'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { PHOTO_KEYS } from '../../constants/photos'

import AuditService from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'
import { getBackLink, createPhotoFromFile } from '../../helpers/photos'

const upload = multer({ storage: multer.memoryStorage() })

const { csrfSynchronisedProtection } = csrfSync({
  // eslint-disable-next-line no-underscore-dangle
  getTokenFromRequest: req => req.body._csrf,
})

export default function confirmPhotoRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_CONFIRM_PHOTO_CAPTURE, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const { user } = res.locals

    await auditLogged(
      'VIEW_LOG_APPLICATION_CONFIRM_PHOTO',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_LOG_APPLICATION_CONFIRM_PHOTO_FAILURE' : what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: applicationData?.prisonerId || 'NONE',
          subjectType: applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: {
            ...extraDetails,
            ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
          },
        })
      },
      async () => {
        if (!applicationData?.loggingMethod) {
          return res.redirect(URLS.LOG_METHOD)
        }

        const photos = applicationData.photos ?? {}
        const { currentPhoto } = applicationData

        if (!currentPhoto || !photos?.[currentPhoto]) {
          return res.redirect(URLS.LOG_PHOTO_CAPTURE)
        }
        const photoData = photos[currentPhoto]
        const imgSrc = `data:${photoData.mimetype};base64,${photoData.buffer}`

        return res.render(PATHS.LOG_APPLICATION.CONFIRM_PHOTO_CAPTURE, {
          title: 'Confirm image',
          csrfToken: req.csrfToken(),
          applicationType: applicationData.type.name,
          imgSrc,
          fileName: photoData.filename,
          fileType: photoData.mimetype,
          backLink: getBackLink(req),
        })
      },
    )
  })

  router.post(
    URLS.LOG_CONFIRM_PHOTO_CAPTURE,
    upload.single('file'),
    csrfSynchronisedProtection,
    async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { file } = req
      const { user } = res.locals
      const prisonerId = applicationData?.prisonerId || 'NONE'
      const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
        'EDIT_LOG_APPLICATION_CONFIRM_PHOTO',
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
        if (!applicationData?.loggingMethod) {
          await logFailure({ failureReason: 'Logging method not selected' })
          return res.redirect(URLS.LOG_METHOD)
        }

        const { currentPhoto, isFromCheckDetailsPage } = applicationData
        const photos = applicationData.photos ?? {}

        if (!file || !currentPhoto || !photos[currentPhoto]) {
          await logFailure({ failureReason: 'Photo prerequisite missing' })
          return res.redirect(URLS.LOG_PHOTO_CAPTURE)
        }

        photos[currentPhoto] = createPhotoFromFile(file, currentPhoto)

        updateSessionData(req, { photos })

        if (isFromCheckDetailsPage) {
          updateSessionData(req, { isFromCheckDetailsPage: false })
          await logSuccess()
          return res.redirect(URLS.LOG_CONFIRM_DETAILS)
        }

        if (currentPhoto === PHOTO_KEYS.PHOTO_1 && !photos[PHOTO_KEYS.PHOTO_2]) {
          await logSuccess()
          return res.redirect(URLS.LOG_ADD_ANOTHER_PHOTO)
        }

        await logSuccess()
        return res.redirect(URLS.LOG_ADDITIONAL_PHOTO_DETAILS)
      } catch (error) {
        await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    },
  )

  return router
}
