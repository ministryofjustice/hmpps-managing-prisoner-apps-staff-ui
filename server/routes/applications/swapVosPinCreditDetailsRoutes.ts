import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'

export default function swapVosPinCreditDetailsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/log/swap-vos-pin-credit-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.LOG_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      if (!req.session.applicationData?.type) {
        return res.redirect('log/application-type')
      }

      return res.render('pages/log/swap-vos-pin-credit-details', {
        title: 'Log swap VOs for PIN credit details',
        appTypeTitle: req.session.applicationData.type.name,
      })
    }),
  )

  return router
}
