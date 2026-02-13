import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { PHOTO_KEYS } from '../../constants/photos'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/http/session'
import { getBackLink, resetSecondPhotoIfExists } from '../../helpers/photos'

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

      resetSecondPhotoIfExists(req)

      await auditService.logPageView(Page.LOG_ADD_ANOTHER_PHOTO_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.ADD_ANOTHER_PHOTO, {
        title: 'Do you want to add another photo?',
        applicationType: applicationData.type.name,
        backLink: getBackLink(req),
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
          addAnotherPhoto: applicationData.addAnotherPhoto || null,
          backLink: getBackLink(req),
        })
      }

      if (addAnotherPhoto === 'yes') {
        updateSessionData(req, { addAnotherPhoto, currentPhoto: PHOTO_KEYS.PHOTO_2 })
        return res.redirect(URLS.LOG_PHOTO_CAPTURE)
      }

      updateSessionData(req, { addAnotherPhoto })
      return res.redirect(URLS.LOG_ADDITIONAL_PHOTO_DETAILS)
    }),
  )

  return router
}
