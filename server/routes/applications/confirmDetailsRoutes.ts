import { Request, Response, Router } from 'express'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'

export default function confirmDetailsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      await auditService.logPageView(Page.CONFIRM_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(applicationData?.type.apiValue)

      if (!applicationType) {
        return res.redirect(URLS.APPLICATION_TYPE)
      }

      return res.render(`pages/log-application/confirm/${applicationType.value}`, {
        applicationData,
        appTypeTitle: 'Swap VOs for PIN credit',
        backLink: URLS.APPLICATION_DETAILS,
        title: 'Check details',
      })
    }),
  )

  return router
}
