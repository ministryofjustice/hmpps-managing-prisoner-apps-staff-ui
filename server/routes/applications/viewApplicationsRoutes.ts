import { Request, Response, Router } from 'express'

import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'

export default function viewApplicationRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/view/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationId } = req.params

      const application = {
        id: applicationId,
        type: 'swap-visiting-orders-for-pin-credit',
        dept: 'Business Hub',
      }

      if (!application) {
        res.status(404).send('Application not found')
        return
      }

      await auditService.logPageView(Page.VIEW_APPLICATION_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = APPLICATION_TYPES.find(type => type.value === application.type)

      if (!applicationType) {
        res.status(400).send('Invalid application type')
        return
      }

      res.render(`pages/view-application/${application.type}`, {
        title: applicationType.name,
        application,
      })
    }),
  )

  return router
}
