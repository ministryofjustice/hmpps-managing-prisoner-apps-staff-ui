import { ApplicationData } from 'express-session'
import logger from '../../logger'
import { Application, ApplicationSearchPayload, Group, ViewApplicationsResponse } from '../@types/managingAppsApi'
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
        path: `/v1/prisoners/${prisonerId}/apps/${applicationId}?requestedBy=true&assignedGroup=true`,
      })
    } catch (error) {
      logger.error(`Error fetching application for prisonerId: ${prisonerId}, applicationId: ${applicationId}`, error)
      return null
    }
  }

  async forwardApp(applicationId: string, groupId: string): Promise<void> {
    try {
      await this.restClient.get({
        path: `/v1/apps/${applicationId}/forward/groups/${groupId}`,
      })
    } catch (error) {
      logger.error(`Error updating department for applicationId: ${applicationId}, department: ${groupId}`, error)
    }
  }

  async submitPrisonerApp(applicationData: ApplicationData): Promise<Application | null> {
    try {
      const { prisonerId, type, date: requestedDate, additionalData } = applicationData

      const payload = {
        reference: '',
        type: type.apiValue,
        requestedDate,
        requests: [additionalData],
      }

      return await this.restClient.post({
        path: `/v1/prisoners/${prisonerId}/apps`,
        data: payload,
      })
    } catch (error) {
      logger.error(`Error submitting application for prisonerId: ${applicationData.prisonerId}`, error)
      return null
    }
  }

  async getApps(payload: ApplicationSearchPayload): Promise<ViewApplicationsResponse> {
    try {
      return await this.restClient.post({
        path: `/v1/prisoners/apps/search`,
        data: payload,
      })
    } catch (error) {
      logger.error(`Error fetching applications. Payload: ${JSON.stringify(payload)}`, error)
      return null
    }
  }

  async getGroups(): Promise<Group[]> {
    try {
      return await this.restClient.get({
        path: `/v1/groups`,
      })
    } catch (error) {
      logger.error(`Error fetching groups.`, error)
      return null
    }
  }
}
