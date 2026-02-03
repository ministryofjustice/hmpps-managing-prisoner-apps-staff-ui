import { Request, Response, Router } from 'express'
import multer from 'multer'
import { csrfSync } from 'csrf-sync'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'

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

      const photos = applicationData.photos || []
      if (!photos.length) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      const currentPhoto = photos[photos.length - 1]
      const buffer = Buffer.from(currentPhoto.buffer)
      const imgSrc = `data:${currentPhoto.mimetype};base64,${buffer.toString('base64')}`

      await auditService.logPageView(Page.LOG_CONFIRM_PHOTO_CAPTURE_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.CONFIRM_PHOTO_CAPTURE, {
        title: 'Confirm image',
        csrfToken: req.csrfToken(),
        applicationType: applicationData.type.name,
        imgSrc,
        fileName: currentPhoto.filename,
        fileType: currentPhoto.mimetype,
      })
    }),
  )

  router.post(
    URLS.LOG_CONFIRM_PHOTO_CAPTURE,
    upload.single('file'),
    csrfSynchronisedProtection,
    asyncMiddleware(async (req: Request, res: Response) => {
      if (!req.file) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      const photos = req.session.applicationData.photos || []

      if (!photos.length) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      photos[photos.length - 1] = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        filename: req.file.originalname,
      }

      updateSessionData(req, { photos })

      return res.redirect(URLS.LOG_ADD_ANOTHER_PHOTO)
    }),
  )

  return router
}
