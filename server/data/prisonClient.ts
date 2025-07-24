import logger from '../../logger'
import { InmateDetail } from '../@types/prisonApi'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'

export default class PrisonApiClient {
  public restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonApiClient', config.apis.prison as ApiConfig, token)
  }

  async getPrisonerByPrisonNumber(prisonerNumber: string): Promise<InmateDetail | null> {
    try {
      return await this.restClient.get({
        path: `/api/offenders/${prisonerNumber}`,
      })
    } catch (error) {
      logger.error(`Error fetching prisoner`, error)
      return null
    }
  }
}
