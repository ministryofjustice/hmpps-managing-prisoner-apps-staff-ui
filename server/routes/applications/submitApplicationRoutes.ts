import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'

export default function submitApplicationRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/submit/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      const application = {
        id: '13d2c453-be11-44a8-9861-21fd8ae6e911',
        reference: '1232143',
        assignedGroup: {
          id: '591185f2-863a-4a32-9812-c12f40b94ccb',
          name: 'Business Hub',
          establishment: {
            id: 'ABC',
            name: 'HMP ABC',
          },
          initialApp: 'SWAP_VISITING_ORDERS_FOR_PIN_CREDIT',
          type: 'DEPARTMENT',
          email: 'business+hub+ABC@justice.gov.uk',
        },
        type: 'SWAP_VISITING_ORDERS_FOR_PIN_CREDIT',
        requestedBy: 'G123456',
        requestedDate: '2024-09-15T00:00:00Z',
        createdDate: '2024-09-16T12:38:03Z',
        createdBy: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
        lastModifiedBy: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
        lastModifiedDate: '2024-09-16T12:38:03Z',
        requests: [
          {
            id: '8c33eb4e-9f32-411e-bb09-225615f0a266',
            amount: 5.0,
          },
          {
            id: '251828ca-557f-46a3-8354-b07e19fc023b',
            amount: 10.0,
          },
        ],
      }

      if (!application) {
        res.redirect('/applications')
        return
      }

      await auditService.logPageView(Page.SUBMIT_APPLICATION_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = APPLICATION_TYPES.find(type => type.apiValue === application.type)

      if (!applicationType) {
        res.redirect('/applications?error=unknown-type')
        return
      }

      res.render(`pages/submit-application/${applicationType.value}`, {
        title: applicationType.name,
        application,
      })
    }),
  )

  return router
}
