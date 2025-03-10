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

  async getPrisonerApp(prisonerId: string, applicationId: string): Promise<Application | null> {
    try {
      return await this.restClient.get({
        path: `/v1/prisoners/${prisonerId}/apps/${applicationId}?requestedBy=true`,
      })
    } catch (error) {
      logger.error(`Error fetching application for prisonerId: ${prisonerId}, applicationId: ${applicationId}`, error)
      return null
    }
  }

  async forwardApp(prisonerId: string, applicationId: string, department: string): Promise<void> {
    try {
      await this.restClient.put({
        path: `/v1/`,
      })
    } catch (error) {
      logger.error(
        `Error updating department for prisonerId: ${prisonerId}, applicationId: ${applicationId}, department: ${department}`,
        error,
      )
    }
  }
}
