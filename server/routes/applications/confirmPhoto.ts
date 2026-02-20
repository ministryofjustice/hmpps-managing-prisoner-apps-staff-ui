import { Request, Response, Router } from 'express'
import multer from 'multer'
import { csrfSync } from 'csrf-sync'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { PHOTO_KEYS } from '../../constants/photos'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'
import { getBackLink, createPhotoFromFile } from '../../helpers/photos'

const upload = multer({ storage: multer.memoryStorage() })

const { csrfSynchronisedProtection } = csrfSync({
  // eslint-disable-next-line no-underscore-dangle
  getTokenFromRequest: req => req.body._csrf,
})

export default function confirmPhotoRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.LOG_CONFIRM_PHOTO_CAPTURE,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      const photos = applicationData.photos ?? {}
      const { currentPhoto } = applicationData

      if (!currentPhoto || !photos?.[currentPhoto]) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }
      const photoData = photos[currentPhoto]
      const buffer = Buffer.from(photoData.buffer)
      const imgSrc = `data:${photoData.mimetype};base64,${buffer.toString('base64')}`

      await auditService.logPageView(Page.LOG_CONFIRM_PHOTO_CAPTURE_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.CONFIRM_PHOTO_CAPTURE, {
        title: 'Confirm image',
        csrfToken: req.csrfToken(),
        applicationType: applicationData.type.name,
        imgSrc,
        fileName: photoData.filename,
        fileType: photoData.mimetype,
        backLink: getBackLink(req),
      })
    }),
  )

  router.post(
    URLS.LOG_CONFIRM_PHOTO_CAPTURE,
    upload.single('file'),
    csrfSynchronisedProtection,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { file } = req

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      const { currentPhoto, isFromCheckDetailsPage } = applicationData
      const photos = applicationData.photos ?? {}

      if (!file || !currentPhoto || !photos[currentPhoto]) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      photos[currentPhoto] = createPhotoFromFile(file, currentPhoto)

      updateSessionData(req, { photos })

      if (isFromCheckDetailsPage) {
        updateSessionData(req, { isFromCheckDetailsPage: false })
        return res.redirect(URLS.LOG_CONFIRM_DETAILS)
      }

      if (currentPhoto === PHOTO_KEYS.PHOTO_1 && !photos[PHOTO_KEYS.PHOTO_2]) {
        return res.redirect(URLS.LOG_ADD_ANOTHER_PHOTO)
      }

      return res.redirect(URLS.LOG_ADDITIONAL_PHOTO_DETAILS)
    }),
  )

  return router
}
