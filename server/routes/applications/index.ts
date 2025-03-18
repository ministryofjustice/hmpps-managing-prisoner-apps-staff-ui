import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'
import TestData from '../testutils/testData'
import actionAndReplyRoutes from './actionAndReplyRoutes'
import applicationDetailsRoutes from './applicationDetailsRoutes'
import applicationTypeRoutes from './applicationTypeRoutes'
import changeApplicationRoutes from './changeApplicationRoutes'
import commentsRoutes from './commentsRoutes'
import confirmDetailsRoutes from './confirmDetailsRoutes'
import forwardApplicationRoutes from './forwardApplicationRoutes'
import prisonerDetailsRoutes from './prisonerDetailsRoutes'
import submitApplicationRoutes from './submitApplicationRoutes'
import viewApplicationRoutes from './viewApplicationsRoutes'

export default function applicationsRoutes({
  auditService,
  managingPrisonerAppsService,
  prisonService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  prisonService: PrisonService
}): Router {
  const router = Router()

  router.get(
    '/',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.APPLICATIONS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const { sections } = new TestData()

      res.render('pages/applications', { title: 'Applications', sections })
    }),
  )

  router.use(actionAndReplyRoutes({ auditService, managingPrisonerAppsService }))
  router.use(applicationDetailsRoutes({ auditService }))
  router.use(applicationTypeRoutes({ auditService }))
  router.use(changeApplicationRoutes({ auditService, managingPrisonerAppsService }))
  router.use(commentsRoutes({ auditService, managingPrisonerAppsService }))
  router.use(confirmDetailsRoutes({ auditService }))
  router.use(forwardApplicationRoutes({ auditService, managingPrisonerAppsService }))
  router.use(prisonerDetailsRoutes({ auditService, prisonService }))
  router.use(submitApplicationRoutes({ auditService }))
  router.use(viewApplicationRoutes({ auditService, managingPrisonerAppsService }))

  return router
}
