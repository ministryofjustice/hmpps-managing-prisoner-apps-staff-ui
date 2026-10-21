import { Request, Response, Router } from 'express'

import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { URLS } from '../../constants/urls'
import { updateSessionData } from '../../utils/http/session'
import { PHOTO_KEYS } from '../../constants/photos'
import type { PhotoKey } from '../../constants/photos'
import AuditService from '../../services/auditService'

export default function removePhotoRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_REMOVE_PHOTO, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const photoKey = req.query.photo as PhotoKey
    const { user } = res.locals

    await auditLogged(
      'DELETE_LOG_APPLICATION_PHOTO',
      async (what, extraDetails = {}) => {
        const failure = Boolean(res.locals.auditFailureReason)
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && failure ? 'DELETE_LOG_APPLICATION_PHOTO_FAILURE' : what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: applicationData?.prisonerId || 'NONE',
          subjectType: applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: {
            ...(photoKey ? { photoKey } : {}),
            ...extraDetails,
            ...(failure ? { failureReason: res.locals.auditFailureReason } : {}),
          },
        })
      },
      async () => {
        if (!applicationData?.photos?.[photoKey]) res.locals.auditFailureReason = 'Photo not found'

        if (!applicationData?.photos || !photoKey) {
          return res.redirect(URLS.LOG_CONFIRM_DETAILS)
        }

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
      },
    )
  })

  return router
}
