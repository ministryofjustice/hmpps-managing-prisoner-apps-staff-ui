import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
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
import logMethodRouter from './logMethod'
import photoCaptureRouter from './photoCapture'
import confirmPhotoRouter from './confirmPhoto'
import anotherPhotoRouter from './anotherPhoto'

export default function applicationsRoutes({
  auditService,
  managingPrisonerAppsService,
  prisonService,
  personalRelationshipsService,
  osPlacesAddressService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  prisonService: PrisonService
  personalRelationshipsService: PersonalRelationshipsService
  osPlacesAddressService?: OsPlacesAddressService
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
  router.use(
    appDetailsRouter({
      auditService,
      managingPrisonerAppsService,
      personalRelationshipsService,
      osPlacesAddressService,
    }),
  )
  router.use(appTypeRouter({ auditService, managingPrisonerAppsService }))
  router.use(
    changeAppRouter({
      auditService,
      managingPrisonerAppsService,
      personalRelationshipsService,
      osPlacesAddressService,
    }),
  )
  router.use(commentsRouter({ auditService, managingPrisonerAppsService }))
  router.use(confirmAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(departmentsRouter({ auditService, managingPrisonerAppsService }))
  router.use(forwardAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(groupsRouter({ auditService, managingPrisonerAppsService }))
  router.use(historyRouter({ auditService, managingPrisonerAppsService }))
  router.use(prisonerRouter({ auditService, prisonService }))
  router.use(submitAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(viewAppsRouter({ auditService, managingPrisonerAppsService, prisonService }))
  router.use(logMethodRouter({ auditService }))
  router.use(photoCaptureRouter({ auditService }))
  router.use(confirmPhotoRouter({ auditService }))
  router.use(anotherPhotoRouter({ auditService }))

  router.get(
    '/api/addresses/find/:query',
    asyncMiddleware(async (req: Request, res: Response) => {
      try {
        const { query } = req.params
        if (!query) {
          res.status(400).json({ status: 400, error: 'Query parameter is required' })
          return
        }

        const results = await osPlacesAddressService.getAddressesMatchingQuery(query)

        res.json({ status: 200, results })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        res.status(500).json({ status: 500, error: errorMessage })
      }
    }),
  )

  return router
}
