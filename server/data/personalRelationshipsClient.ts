import logger from '../../logger'
import { ReferenceCode } from '../@types/personalRelationshipsApi'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'

export default class PersonalRelationshipsApiClient {
  public restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient(
      'personalrelationshipsApiClient',
      config.apis.personalRelationships as ApiConfig,
      token,
    )
  }

  async relationshipList(groupCode: string): Promise<ReferenceCode[] | null> {
    try {
      return await this.restClient.get({
        path: `/reference-codes/group/${groupCode}`,
      })
    } catch (error) {
      logger.error(`Error fetching relationship list: ${error?.message}`, error)
      return null
    }
  }
}
