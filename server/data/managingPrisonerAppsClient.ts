import logger from '../../logger'
import { Application } from '../@types/managingAppsApi'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'

export default class ManagingPrisonerAppsApiClient {
  public restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient(
      'managingPrisonerAppsApiClient',
      config.apis.managingPrisonerApps as ApiConfig,
      token,
    )
  }

  async getPrisonerApp(applicationId: string, prisonerId: string): Promise<Application | null> {
    try {
      return await this.restClient.get({
        path: `/v1/prisoners/${prisonerId}/apps/${applicationId}`,
      })
    } catch (error) {
      logger.error(`Error fetching application for prisonerId: ${prisonerId}, applicationId: ${applicationId}`, error)
      return null
    }
  }
}
