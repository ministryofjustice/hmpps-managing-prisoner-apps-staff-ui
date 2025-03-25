import { Request, Response, Router } from 'express'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'
import { updateSessionData } from '../../utils/session'
import { URLS } from '../../constants/urls'
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

      return res.render(`pages/log-application/application-details/${applicationType.value}`, {
        title: 'Log swap VOs for PIN credit details',
        appTypeTitle: 'Swap VOs for PIN credit',
      })
    }),
  )

  router.post(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      const applicationType = getApplicationType(req.session.applicationData?.type.apiValue)
      const fieldToValidate = req.body.swapVosPinCreditDetails

      const isSwapVOsToPinCredit =
        applicationData?.type?.apiValue ===
        APPLICATION_TYPES.find(type => type.value === 'swap-visiting-orders-for-pin-credit')?.apiValue

      const fieldName = isSwapVOsToPinCredit ? 'Details' : ''

      const errors = validateTextField(fieldToValidate, fieldName)

      if (Object.keys(errors).length > 0) {
        return res.render(`pages/log-application/application-details/${applicationType.value}`, {
          errors,
          title: 'Log swap VOs for PIN credit details',
          appTypeTitle: 'Swap VOs for PIN credit',
          fieldToValidate,
        })
      }

      updateSessionData(req, {
        additionalData: {
          ...applicationData?.additionalData,
          ...(isSwapVOsToPinCredit ? { swapVOsToPinCreditDetails: req.body.swapVosPinCreditDetails } : {}),
        },
      })

      return res.redirect('/log/confirm')
    }),
  )

  return router
}
