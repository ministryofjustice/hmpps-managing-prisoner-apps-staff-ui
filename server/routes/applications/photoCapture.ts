import { Request, Response, Router } from 'express'
import multer from 'multer'
import { csrfSync } from 'csrf-sync'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { PHOTO_KEYS } from '../../constants/photos'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'

import { updateSessionData } from '../../utils/http/session'
import { getBackLink, createPhotoFromFile, handlePhotoQueryParams } from '../../helpers/photos'

const upload = multer({ storage: multer.memoryStorage() })

const { csrfSynchronisedProtection } = csrfSync({
  // eslint-disable-next-line no-underscore-dangle
  getTokenFromRequest: req => req.body._csrf,
})

export default function photoCaptureRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.LOG_PHOTO_CAPTURE,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session
      const { retake, image } = req.query

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      handlePhotoQueryParams(req, retake as string, image as string)

      await auditService.logPageView(Page.LOG_PHOTO_CAPTURE_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.PHOTO_CAPTURE, {
        title: 'Take a photo of the application',
        applicationType: applicationData.type.name,
        LOG_PHOTO_CAPTURE: URLS.LOG_PHOTO_CAPTURE,
        backLink: getBackLink(req),
      })
    }),
  )

  router.post(
    URLS.LOG_PHOTO_CAPTURE,
    upload.single('file'),
    csrfSynchronisedProtection,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { file } = req

      if (!file) return res.redirect(URLS.LOG_PHOTO_CAPTURE)

      const currentPhoto = applicationData.currentPhoto ?? PHOTO_KEYS.PHOTO_1
      const photos = applicationData.photos ?? {}

      photos[currentPhoto] = createPhotoFromFile(file, currentPhoto)

      updateSessionData(req, { photos, currentPhoto })

      return res.redirect(URLS.LOG_CONFIRM_PHOTO_CAPTURE)
    }),
  )

  router.get(
    `${URLS.LOG_VIEW_PHOTO}/:photoKey`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const photoKey = req.params.photoKey as 'photo1' | 'photo2'

      const photo = applicationData?.photos?.[photoKey]

      if (!photo) {
        res.status(404).render('pages/error', {
          message: 'Photo not found',
          status: 404,
        })
        return
      }

      res.setHeader('Content-Type', photo.mimetype)
      res.setHeader('Content-Disposition', `inline; filename="${photo.filename}"`)
      res.send(Buffer.from(photo.buffer))
    }),
  )

  return router
}
