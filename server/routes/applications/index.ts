import { Request, Response, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'
import PrisonService from '../../services/prisonService'

import actionAppRouter from './actionApp'
import appDetailsRouter from './appDetails'
import appTypeRouter from './appType'
import changeAppRouter from './changeApp'
import commentsRouter from './comments'
import confirmAppRouter from './confirmApp'
import departmentsRouter from './departments'
import forwardAppRouter from './forwardApp'
import groupsRouter from './groups'
import historyRouter from './history'
import prisonerRouter from './prisoner'
import submitAppRouter from './submitApp'
import viewAppsRouter from './view'

export default function applicationsRoutes({
  auditService,
  managingPrisonerAppsService,
  prisonService,
  personalRelationshipsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  prisonService: PrisonService
  personalRelationshipsService: PersonalRelationshipsService
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

  router.use(actionAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(appDetailsRouter({ auditService, managingPrisonerAppsService, personalRelationshipsService }))
  router.use(appTypeRouter({ auditService, managingPrisonerAppsService }))
  router.use(changeAppRouter({ auditService, managingPrisonerAppsService, personalRelationshipsService }))
  router.use(commentsRouter({ auditService, managingPrisonerAppsService }))
  router.use(confirmAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(departmentsRouter({ auditService, managingPrisonerAppsService }))
  router.use(forwardAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(groupsRouter({ auditService, managingPrisonerAppsService }))
  router.use(historyRouter({ auditService, managingPrisonerAppsService }))
  router.use(prisonerRouter({ auditService, prisonService }))
  router.use(submitAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(viewAppsRouter({ auditService, managingPrisonerAppsService, prisonService }))

  return router
}
