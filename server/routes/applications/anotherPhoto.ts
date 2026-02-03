import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'

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

      await auditService.logPageView(Page.LOG_ADD_ANOTHER_PHOTO_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.ADD_ANOTHER_PHOTO, {
        title: 'Do you want to add another photo?',
        applicationType: applicationData.type.name,
        LOG_ADD_ANOTHER_PHOTO: URLS.LOG_ADD_ANOTHER_PHOTO,
        backLink: URLS.LOG_CONFIRM_PHOTO_CAPTURE,
      })
    }),
  )

  return router
}
