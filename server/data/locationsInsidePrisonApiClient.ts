import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'
import { ResidentialLocation } from '../@types/locationsInsidePrisonApi'
import config from '../config'

export default class LocationsInsidePrisonApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('locationsInsidePrisonApiClient', config.apis.locationsInsidePrison, logger, authenticationClient)
  }

  async getResidentialHierarchy(prisonId: string): Promise<ResidentialLocation[] | null> {
    try {
      return await this.get(
        {
          path: `/locations/prison/${encodeURIComponent(prisonId)}/residential-hierarchy?maxLevel=2&includeVirtualLocations=false&includeInactive=false`,
        },
        asSystem(),
      )
    } catch (error) {
      logger.error(`Error fetching residential locations for prison ${prisonId}`, error)
      return null
    }
  }
}
