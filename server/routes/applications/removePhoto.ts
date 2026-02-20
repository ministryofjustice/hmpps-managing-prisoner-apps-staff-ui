import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { URLS } from '../../constants/urls'
import { updateSessionData } from '../../utils/http/session'
import { PHOTO_KEYS } from '../../constants/photos'
import type { PhotoKey } from '../../constants/photos'
import AuditService, { Page } from '../../services/auditService'

export default function removePhotoRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.LOG_REMOVE_PHOTO,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session
      const photoKey = req.query.photo as PhotoKey

      if (!applicationData?.photos || !photoKey) {
        return res.redirect(URLS.LOG_CONFIRM_DETAILS)
      }

      await auditService.logPageView(Page.LOG_REMOVE_PHOTO_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const photos = { ...applicationData.photos }

      delete photos[photoKey]

      let newCurrentPhoto: PhotoKey = PHOTO_KEYS.PHOTO_1

      if (photos[PHOTO_KEYS.PHOTO_2]) {
        newCurrentPhoto = PHOTO_KEYS.PHOTO_2
      }
      const newAddAnotherPhoto = photos[PHOTO_KEYS.PHOTO_2] ? 'yes' : 'no'

      updateSessionData(req, {
        photos,
        currentPhoto: newCurrentPhoto,
        addAnotherPhoto: newAddAnotherPhoto,
      })

      return res.redirect(URLS.LOG_CONFIRM_DETAILS)
    }),
  )

  return router
}
