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
      const applicationTypeValue = applicationData?.type?.value

      const errors: Record<string, string> = {}
      const additionalData: Record<string, unknown> = {}

      const templateData: Record<string, unknown> = {
        title: 'Log details',
        appType: applicationType.name,
      }

      switch (applicationTypeValue) {
        case 'swap-visiting-orders-for-pin-credit': {
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

        case 'add-emergency-pin-phone-credit': {
          const { amount, reason } = req.body
          const fieldErrors = {
            ...validateTextField(amount, 'Amount'),
            ...validateTextField(reason, 'Reason'),
          }

          Object.entries({ amount, reason }).forEach(([field, value]) => {
            if (!fieldErrors[field]) {
              additionalData[field] = value
            } else {
              templateData[field] = value
            }
          })

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
