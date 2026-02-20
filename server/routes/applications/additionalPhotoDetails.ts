import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'
import { getBackLink } from '../../helpers/photos'
import { validateTextField } from '../validate/validateTextField'

export default function additionalPhotoDetailsRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.LOG_ADDITIONAL_PHOTO_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      const photos = applicationData.photos ?? {}
      if (Object.keys(photos).length === 0) return res.redirect(URLS.LOG_PHOTO_CAPTURE)

      const additionalDetails = applicationData.photoAdditionalDetails ?? ''

      await auditService.logPageView(Page.LOG_ADDITIONAL_PHOTO_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.ADDITIONAL_PHOTO_DETAILS, {
        title: 'Enter additional details',
        applicationType: applicationData.type.name,
        photos: Object.values(photos),
        backLink: getBackLink(req),
        additionalDetails,
      })
    }),
  )

  router.post(
    URLS.LOG_ADDITIONAL_PHOTO_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { additionalDetails } = req.body

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      const photos = applicationData.photos ?? {}

      if (Object.keys(photos).length === 0) {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      const errors = validateTextField({ fieldValue: additionalDetails, fieldName: 'Details', isRequired: false })

      if (Object.keys(errors).length > 0) {
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

      return res.redirect(URLS.LOG_CONFIRM_DETAILS)
    }),
  )

  return router
}
