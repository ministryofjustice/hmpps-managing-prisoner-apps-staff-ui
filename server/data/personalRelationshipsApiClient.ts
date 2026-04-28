import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'
import { ReferenceCode } from '../@types/personalRelationshipsApi'
import config from '../config'

export default class PersonalRelationshipsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('personalRelationshipsApiClient', config.apis.personalRelationships, logger, authenticationClient)
  }

  async getRelationships(groupCode: string): Promise<ReferenceCode[] | null> {
    try {
      return await this.get(
        {
          path: `/reference-codes/group/${groupCode}`,
        },
        asSystem(),
      )
    } catch (error) {
      logger.error(`Error fetching relationship list: ${error?.message}`, error)
      return null
    }
  }
}
