import { Router } from 'express'

import type { Services } from '../services'

import applicationsRoutes from './applications'
import staticPagesRoutes from './static-pages/staticPagesRoutes'

export default function routes({
  auditService,
  managingPrisonerAppsService,
  prisonService,
  personalRelationshipsService,
  osPlacesAddressService,
}: Services): Router {
  const router = Router()

  router.use(
    '/',
    applicationsRoutes({
      auditService,
      managingPrisonerAppsService,
      prisonService,
      personalRelationshipsService,
      osPlacesAddressService,
    }),
  )
  router.use('/', staticPagesRoutes())

  return router
}
