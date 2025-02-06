import { Request, Response, Router } from 'express'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/session'

export default function swapVosPinCreditDetailsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/log/swap-vos-pin-credit-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.LOG_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const selectedAppType = APPLICATION_TYPES.find(type => type.value === req.session.applicationData?.type.value)

      if (!selectedAppType) {
        return res.redirect('/log/application-type')
      }

      return res.render('pages/log/swap-vos-pin-credit-details', {
        title: 'Log swap VOs for PIN credit details',
        appTypeTitle: 'Swap VOs for PIN credit',
      })
    }),
  )

  router.post(
    '/log/swap-vos-pin-credit-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      updateSessionData(req, {
        additionalData: {
          ...req.session.applicationData?.additionalData,
          swapVOsToPinCreditDetails: req.body.swapVosPinCreditDetails,
        },
      })

      res.redirect(`/log/swap-vos-pin-credit-details/confirm`)
    }),
  )

  router.get(
    '/log/swap-vos-pin-credit-details/confirm',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.CONFIRM_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const selectedAppType = APPLICATION_TYPES.find(type => type.value === req.session.applicationData?.type.value)

      if (!selectedAppType) {
        return res.redirect('/log/application-type')
      }

      return res.render('pages/log/confirm-swap-vos-pin-credit-details', {
        title: 'Check details',
        appTypeTitle: 'Swap VOs for PIN credit',
        session: req.session,
      })
    }),
  )

  return router
}
