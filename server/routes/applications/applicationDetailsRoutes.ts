import { Request, Response, Router } from 'express'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'

export default function applicationDetailsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      await auditService.logPageView(Page.LOG_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(applicationData?.type.apiValue)

      const additionalData = applicationData?.additionalData || {}

      const data = applicationType ? getAppTypeLogDetailsData(applicationType, additionalData) : null

      if (!applicationType || !data) {
        return res.redirect(URLS.APPLICATION_TYPE)
      }

      const { details, amount, reason } = data
      return res.render(`pages/log-application/application-details/index`, {
        title: 'Log details',
        applicationType,
        details,
        amount,
        reason,
      })
    }),
  )

  router.post(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware((req, res) => {
      const { applicationData } = req.session

      return handleApplicationDetails(req, res, {
        getAppType: () => getApplicationType(applicationData?.type.apiValue),
        getTemplateData: (_req, _res, appType) => ({ applicationType: appType }),
        renderPath: 'pages/log-application/application-details/index',
        successRedirect: () => '/log/confirm',
      })
    }),
  )

  return router
}
