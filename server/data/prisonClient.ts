import logger from '../../logger'
import { PrisonerDetail } from '../@types/prisonApi'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'

export default class PrisonApiClient {
  public restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonApiClient', config.apis.prison as ApiConfig, token)
  }

  async getPrisonerByPrisonNumber(prisonNumber: string): Promise<PrisonerDetail | null> {
    try {
      return await this.restClient.get({
        path: `/api/prisoners/${prisonNumber}`,
      })
    } catch (error) {
      logger.error(`Error fetching prisoner`, error)
      return null
    }
  }
}
