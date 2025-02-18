import { Router } from 'express'

import type { Services } from '../services'

import applicationsRoutes from './applications'

export default function routes({ auditService, managingPrisonerAppsService }: Services): Router {
  const router = Router()

  router.use('/', applicationsRoutes({ auditService, managingPrisonerAppsService }))

  return router
}
