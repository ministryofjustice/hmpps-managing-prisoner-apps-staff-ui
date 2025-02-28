import { Router } from 'express'

import type { Services } from '../services'

import applicationsRoutes from './applications'

export default function routes({ auditService, managingPrisonerAppsService, prisonService }: Services): Router {
  const router = Router()

  router.use('/', applicationsRoutes({ auditService, managingPrisonerAppsService, prisonService }))

  return router
}
