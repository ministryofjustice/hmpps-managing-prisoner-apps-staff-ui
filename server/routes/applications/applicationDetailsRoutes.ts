import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'
import { updateSessionData } from '../../utils/session'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'

export default function swapVosPinCreditDetailsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/log/application-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.LOG_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(req.session.applicationData?.type.apiValue)

      if (!applicationType) {
        return res.redirect('/log/application-type')
      }

      return res.render(`pages/log-application/application-details/${applicationType.value}`, {
        title: 'Log swap VOs for PIN credit details',
        appTypeTitle: 'Swap VOs for PIN credit',
      })
    }),
  )

  router.post(
    '/log/application-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      const isSwapVOsToPinCredit =
        applicationData?.type?.apiValue ===
        APPLICATION_TYPES.find(type => type.value === 'swap-visiting-orders-for-pin-credit')?.apiValue

      updateSessionData(req, {
        additionalData: {
          ...applicationData?.additionalData,
          ...(isSwapVOsToPinCredit ? { swapVOsToPinCreditDetails: req.body.swapVosPinCreditDetails } : {}),
        },
      })

      res.redirect('/log/confirm')
    }),
  )

  router.get(
    '/log/confirm',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.CONFIRM_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(req.session.applicationData?.type.apiValue)

      if (!applicationType) {
        return res.redirect('/log/application-type')
      }

      return res.render(`pages/log-application/confirm/${applicationType.value}`, {
        title: 'Check details',
        appTypeTitle: 'Swap VOs for PIN credit',
        session: req.session,
      })
    }),
  )

  return router
}
