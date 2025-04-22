import { Request, Response, Router } from 'express'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'
import { updateSessionData } from '../../utils/session'
import { validateTextField } from '../validate/validateTextField'
import { validateAmountField } from '../validate/validateAmountField'
import { APPLICATION_TYPE_VALUES } from '../../constants/applicationTypes'

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
      const applicationTypeValue = applicationData?.type?.value

      const errors: Record<string, string> = {}
      const additionalData: Record<string, unknown> = {}

      const templateData: Record<string, unknown> = {
        title: 'Log details',
        appType: applicationType.name,
      }

      switch (applicationTypeValue) {
        case APPLICATION_TYPE_VALUES.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: {
          const { details } = req.body
          const detailErrors = validateTextField(details, 'Details')

          if (Object.keys(detailErrors).length === 0) {
            additionalData.details = details
          } else {
            Object.assign(errors, detailErrors)
            templateData.details = details
          }
          break
        }

        case APPLICATION_TYPE_VALUES.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP: {
          const { amount, reason } = req.body
          const { errors: amountErrors, value: sanitizedAmount } = validateAmountField(amount, 'Amount', true)
          const reasonErrors = validateTextField(reason, 'Reason', true)

          const fieldErrors = {
            ...amountErrors,
            ...reasonErrors,
          }

          templateData.amount = amount
          templateData.reason = reason

          if (!amountErrors?.Amount) {
            additionalData.amount = sanitizedAmount
          }

          if (!reasonErrors?.Reason) {
            additionalData.reason = reason
          }

          Object.assign(errors, fieldErrors)
          break
        }

        default: {
          return res.redirect('/log/confirm')
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.render('pages/log-application/application-details/index', {
          ...templateData,
          errors,
          applicationType,
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
