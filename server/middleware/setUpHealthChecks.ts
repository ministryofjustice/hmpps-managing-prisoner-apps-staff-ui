/* eslint-disable no-param-reassign */
import express, { Router } from 'express'

import { monitoringMiddleware, endpointHealthComponent } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'

export default function setUpHealthChecks(
  applicationInfo: ApplicationInfo,
  managingPrisonerAppsService: ManagingPrisonerAppsService,
): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis)

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig.map(([name, options]) => endpointHealthComponent(logger, name, options)),
  })

  router.get('/health', middleware.health)

  router.get(
    '/info',
    async (req, res, next) => {
      try {
        const activeAgencies = await managingPrisonerAppsService.getActiveAgencies()
        applicationInfo.additionalFields = { activeAgencies }
        next()
      } catch {
        res.status(503).send()
      }
    },
    middleware.info,
  )

  router.get('/ping', middleware.ping)

  return router
}
