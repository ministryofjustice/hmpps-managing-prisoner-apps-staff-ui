import { ApplicationData } from 'express-session'
import logger from '../../logger'
import {
  Application,
  ApplicationSearchPayload,
  Comment,
  CommentsResponse,
  Group,
  PrisonerSearchResult,
  ViewApplicationsResponse,
} from '../@types/managingAppsApi'
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

  async getApps(payload: ApplicationSearchPayload): Promise<ViewApplicationsResponse | null> {
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

  async getGroups(): Promise<Group[] | null> {
    try {
      return await this.restClient.get({
        path: `/v1/groups`,
      })
    } catch (error) {
      logger.error(`Error fetching groups.`, error)
      return null
    }
  }

  async searchPrisoners(query: string): Promise<PrisonerSearchResult[] | null> {
    try {
      return await this.restClient.get({
        path: `/v1/prisoners/search?name=${query}`,
      })
    } catch (error) {
      logger.error(`Error searching prisoners`, error)
      return null
    }
  }

  async addComment(
    prisonerId: string,
    appId: string,
    payload: { message: string; targetUsers: { id: string }[] },
  ): Promise<void> {
    try {
      await this.restClient.post({
        path: `/v1/prisoners/${prisonerId}/apps/${appId}/comments`,
        data: payload,
      })
    } catch (error) {
      logger.error(`Failed to add comment for prisoner ${prisonerId} on app ${appId}`, error)
    }
  }

  async getComments(prisonerId: string, appId: string, page = 1, size = 20): Promise<CommentsResponse | null> {
    try {
      return await this.restClient.get({
        path: `/v1/prisoners/${prisonerId}/apps/${appId}/comments?page=${page}&size=${size}&createdBy=true`,
      })
    } catch (error) {
      logger.error(`Failed to fetch comments for prisoner ${prisonerId} on app ${appId}`, error)
      return null
    }
  }
}
