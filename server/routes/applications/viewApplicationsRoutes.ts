import { Request, Response, Router } from 'express'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import TestData from '../testutils/testData'

export default function viewApplicationRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/view/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      // const { applicationId, prisonerId } = req.params
      // const { user } = res.locals
      // const application  = await managingPrisonerAppsService.getPrisonerApp(applicationId, prisonerId, user)

      const application = new TestData().prisonerApp

      if (!application) {
        res.redirect('/applications')
        return
      }

      await auditService.logPageView(Page.VIEW_APPLICATION_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = APPLICATION_TYPES.find(type => type.apiValue === application.type)

      if (!applicationType) {
        res.redirect('/applications?error=unknown-type')
        return
      }

      res.render(`pages/view-application/${applicationType.value}`, {
        title: applicationType.name,
        application,
      })
    }),
  )

  return router
}
