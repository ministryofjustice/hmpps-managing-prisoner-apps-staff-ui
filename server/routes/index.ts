import { Router } from 'express'

import type { Services } from '../services'

import applicationsRoutes from './applications'

export default function routes({ auditService, prisonService }: Services): Router {
  const router = Router()

  router.use('/', applicationsRoutes({ auditService, prisonService }))

  return router
}
