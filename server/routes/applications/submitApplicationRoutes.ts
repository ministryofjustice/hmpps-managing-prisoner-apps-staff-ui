import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'

export default function submitApplicationRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/submit/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationId } = req.params

      const application = {
        id: applicationId,
        type: 'swap-visiting-orders-for-pin-credit',
        dept: 'Business Hub',
      }

      if (!application) {
        res.redirect('/applications')
        return
      }

      await auditService.logPageView(Page.SUBMIT_APPLICATION_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = APPLICATION_TYPES.find(type => type.value === application.type)

      if (!applicationType) {
        res.redirect('/applications?error=unknown-type')
        return
      }

      res.render(`pages/log-application/submit/${application.type}`, {
        title: applicationType.name,
        application,
      })
    }),
  )

  return router
}
