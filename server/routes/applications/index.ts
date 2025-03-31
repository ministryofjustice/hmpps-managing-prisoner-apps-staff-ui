import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'
import actionAndReplyRoutes from './actionAndReplyRoutes'
import applicationDetailsRoutes from './applicationDetailsRoutes'
import applicationTypeRoutes from './applicationTypeRoutes'
import changeApplicationRoutes from './changeApplicationRoutes'
import commentsRoutes from './commentsRoutes'
import confirmDetailsRoutes from './confirmDetailsRoutes'
import forwardApplicationRoutes from './forwardApplicationRoutes'
import applicationHistoryRoutes from './applicationHistoryRoutes'
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

      res.render('pages/applications', { title: 'Applications' })
    }),
  )

  router.use(actionAndReplyRoutes({ auditService, managingPrisonerAppsService }))
  router.use(applicationDetailsRoutes({ auditService }))
  router.use(applicationTypeRoutes({ auditService }))
  router.use(changeApplicationRoutes({ auditService, managingPrisonerAppsService }))
  router.use(commentsRoutes({ auditService, managingPrisonerAppsService }))
  router.use(confirmDetailsRoutes({ auditService, managingPrisonerAppsService }))
  router.use(forwardApplicationRoutes({ auditService, managingPrisonerAppsService }))
  router.use(applicationHistoryRoutes({ auditService, managingPrisonerAppsService }))
  router.use(prisonerDetailsRoutes({ auditService, prisonService }))
  router.use(submitApplicationRoutes({ auditService, managingPrisonerAppsService }))
  router.use(viewApplicationRoutes({ auditService, managingPrisonerAppsService, prisonService }))

  return router
}
