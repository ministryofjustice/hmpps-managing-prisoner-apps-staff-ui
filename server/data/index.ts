/* eslint-disable import/first */
import { OsPlacesApiClient } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import applicationInfoSupplier from '../applicationInfo'
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import config from '../config'
import logger from '../../logger'
import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import RedisTokenStore from './tokenStore/redisTokenStore'

export type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  ),
  osPlacesApiClient: new OsPlacesApiClient(logger, config.apis.osPlacesApi),
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient }
