import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'
import { validateTextField } from '../validate/validateTextField'

export default function additionalPhotoDetailsRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.LOG_ADDITIONAL_PHOTO_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      if (!applicationData?.photos?.length) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      await auditService.logPageView(Page.LOG_ADDITIONAL_PHOTO_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const photos = applicationData.photos || []

      const backLink = photos.length >= 2 ? URLS.LOG_CONFIRM_PHOTO_CAPTURE : URLS.LOG_ADD_ANOTHER_PHOTO

      return res.render(PATHS.LOG_APPLICATION.ADDITIONAL_PHOTO_DETAILS, {
        title: 'Enter additional details',
        applicationType: applicationData.type.name,
        photos: applicationData.photos,
        backLink,
      })
    }),
  )

  router.post(
    URLS.LOG_ADDITIONAL_PHOTO_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { additionalDetails } = req.body

      if (!applicationData?.photos?.length) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      const errors = validateTextField({ fieldValue: additionalDetails, fieldName: 'Details', isRequired: false })

      if (Object.keys(errors).length > 0) {
        const photos = applicationData.photos || []
        const backLink = photos.length >= 2 ? URLS.LOG_CONFIRM_PHOTO_CAPTURE : URLS.LOG_ADD_ANOTHER_PHOTO

        return res.render(PATHS.LOG_APPLICATION.ADDITIONAL_PHOTO_DETAILS, {
          title: 'Enter additional details',
          applicationType: applicationData.type.name,
          photos: applicationData.photos,
          backLink,
          additionalDetails,
          errors,
          errorSummary: [{ text: errors.Details.text, href: '#additionalDetails' }],
        })
      }

      updateSessionData(req, { photoAdditionalDetails: additionalDetails })

      return res.redirect(URLS.LOG_CONFIRM_DETAILS)
    }),
  )

  return router
}
