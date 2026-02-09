import { Request, Response, Router } from 'express'

import multer from 'multer'
import { csrfSync } from 'csrf-sync'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'

import { updateSessionData } from '../../utils/http/session'

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

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      await auditService.logPageView(Page.LOG_PHOTO_CAPTURE_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.PHOTO_CAPTURE, {
        title: 'Take a photo of the application',
        applicationType: applicationData.type.name,
        LOG_PHOTO_CAPTURE: URLS.LOG_PHOTO_CAPTURE,
        backLink: URLS.LOG_METHOD,
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

      if (!file) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      const photos = applicationData.photos || []

      const allPhotos = [
        ...photos,
        {
          buffer: file.buffer,
          mimetype: file.mimetype,
          filename: `${file.originalname.replace(/\.[^/.]+$/, '')}[${photos.length}].${file.originalname.split('.').pop()}`,
        },
      ]

      updateSessionData(req, { photos: allPhotos })

      return res.redirect(URLS.LOG_CONFIRM_PHOTO_CAPTURE)
    }),
  )

  return router
}
