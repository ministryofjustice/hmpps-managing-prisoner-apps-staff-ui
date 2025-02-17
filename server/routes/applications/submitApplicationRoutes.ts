import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import TestData from '../testutils/testData'

export default function submitApplicationRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/submit/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      const application = new TestData().submitPrisonerAppData

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
