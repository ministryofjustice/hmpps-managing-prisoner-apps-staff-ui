import { Request, Response, Router } from 'express'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'
import { updateSessionData } from '../../utils/session'
import { validateTextField } from '../validate/validateTextField'

export default function applicationDetailsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.LOG_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(req.session.applicationData?.type.apiValue)

      if (!applicationType) {
        return res.redirect(URLS.APPLICATION_TYPE)
      }

      return res.render(`pages/log-application/application-details/index`, {
        title: 'Log details',
        applicationType,
      })
    }),
  )

  router.post(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const applicationType = getApplicationType(applicationData?.type.apiValue)
      const value = applicationData?.type?.value

      const errors: Record<string, string> = {}
      const additionalData: Record<string, unknown> = {}

      const templateData: Record<string, unknown> = {
        title: 'Log details',
        appType: applicationType.name,
      }

      if (value === 'swap-visiting-orders-for-pin-credit') {
        const { details } = req.body

        Object.assign(errors, validateTextField(details, 'Details'))

        if (!errors.Details) additionalData.details = details
        else templateData.details = details
      }

      if (value === 'add-emergency-pin-phone-credit') {
        const { amount, reason } = req.body

        Object.assign(errors, {
          ...validateTextField(amount, 'Amount'),
          ...validateTextField(reason, 'Reason'),
        })

        if (!errors.Amount) additionalData.amount = amount
        else templateData.amount = amount

        if (!errors.Reason) additionalData.reason = reason
        else templateData.reason = reason
      }

      if (Object.keys(errors).length > 0) {
        return res.render('pages/log-application/application-details/index', {
          ...templateData,
          errors,
        })
      }

      updateSessionData(req, {
        additionalData,
      })

      return res.redirect('/log/confirm')
    }),
  )

  return router
}
