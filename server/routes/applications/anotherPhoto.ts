import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'

const ERROR_MESSAGE = 'Select one'
const ERROR_SUMMARY = 'You need to select if you want to take another photo of the application.'

export default function anotherPhotoRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.LOG_ADD_ANOTHER_PHOTO,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      const photos = applicationData.photos || []

      if (photos.length >= 2) {
        return res.redirect(URLS.LOG_ADDITIONAL_PHOTO_DETAILS)
      }

      await auditService.logPageView(Page.LOG_ADD_ANOTHER_PHOTO_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.ADD_ANOTHER_PHOTO, {
        title: 'Do you want to add another photo?',
        applicationType: applicationData.type.name,
        LOG_ADD_ANOTHER_PHOTO: URLS.LOG_ADD_ANOTHER_PHOTO,
        backLink: URLS.LOG_CONFIRM_PHOTO_CAPTURE,
        addAnotherPhoto: applicationData.addAnotherPhoto || null,
      })
    }),
  )

  router.post(
    URLS.LOG_ADD_ANOTHER_PHOTO,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { addAnotherPhoto } = req.body

      if (!applicationData?.loggingMethod) {
        return res.redirect(URLS.LOG_METHOD)
      }

      if (!addAnotherPhoto) {
        return res.render(PATHS.LOG_APPLICATION.ADD_ANOTHER_PHOTO, {
          title: 'Do you want to add another photo?',
          applicationType: applicationData.type?.name ?? '',
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_SUMMARY, href: '#addAnotherPhoto' }],
          addAnotherPhoto: addAnotherPhoto || null,
          backLink: URLS.LOG_CONFIRM_PHOTO_CAPTURE,
        })
      }

      updateSessionData(req, { addAnotherPhoto })

      if (addAnotherPhoto === 'yes') {
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }
      if (addAnotherPhoto === 'no') {
        return res.redirect(URLS.LOG_ADDITIONAL_PHOTO_DETAILS)
      }
      return res.redirect(URLS.LOG_METHOD)
    }),
  )

  return router
}
