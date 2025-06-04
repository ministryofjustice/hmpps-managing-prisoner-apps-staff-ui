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

  router.get('/info', async (req, res) => {
    try {
      const activeAgencies = await managingPrisonerAppsService.getActiveAgencies()

      res.json({
        git: {
          branch: applicationInfo.branchName,
        },
        build: {
          artifact: applicationInfo.applicationName,
          version: applicationInfo.buildNumber,
          name: applicationInfo.applicationName,
        },
        productId: applicationInfo.productId,
        uptime: Math.floor(process.uptime()),
        activeAgencies,
      })
    } catch {
      res.status(503).send()
    }
  })

  router.get('/ping', middleware.ping)

  return router
}
