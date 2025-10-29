import { ApplicationData } from 'express-session'
import logger from '../../logger'
import {
  App,
  ApplicationSearchPayload,
  AppResponsePayload,
  AppTypeResponse,
  Comment,
  CommentsResponse,
  Department,
  Group,
  History,
  PrisonerSearchResult,
  Response,
  ViewAppsListResponse,
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

  async getActiveAgencies(): Promise<string[]> {
    try {
      return await this.restClient.get({
        path: `/v1/establishments`,
      })
    } catch (error) {
      logger.error(`Error fetching establishments.`, error)
      return null
    }
  }

  async getPrisonerApp(prisonerId: string, applicationId: string): Promise<App | null> {
    try {
      return await this.restClient.get({
        path: `/v1/prisoners/${prisonerId}/apps/${applicationId}?requestedBy=true&assignedGroup=true`,
      })
    } catch (error) {
      logger.error(`Error fetching application for prisonerId: ${prisonerId}, applicationId: ${applicationId}`, error)
      return null
    }
  }

  async forwardApp(applicationId: string, groupId: string, message?: string): Promise<void> {
    try {
      const payload = {
        message: message?.trim() || '',
      }

      await this.restClient.post({
        path: `/v1/apps/${applicationId}/forward/groups/${groupId}`,
        data: payload,
      })
    } catch (error) {
      logger.error(`Error updating department for applicationId: ${applicationId}, department: ${groupId}`, error)
    }
  }

  async submitPrisonerApp(applicationData: ApplicationData): Promise<App | null> {
    try {
      const { prisonerId, type, departmentId, earlyDaysCentre, additionalData } = applicationData
      const firstNightCenter =
        typeof earlyDaysCentre === 'string' ? earlyDaysCentre === 'yes' : Boolean(earlyDaysCentre)

      const payload = {
        reference: '',
        type: type.value,
        requests: [additionalData],
        firstNightCenter,
        department: departmentId,
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

  async getApps(payload: ApplicationSearchPayload): Promise<ViewAppsListResponse | null> {
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
  ): Promise<Comment | null> {
    try {
      return await this.restClient.post({
        path: `/v1/prisoners/${prisonerId}/apps/${appId}/comments`,
        data: payload,
      })
    } catch (error) {
      logger.error(`Failed to add comment for prisoner ${prisonerId} on app ${appId}`, error)
      return null
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

  async getHistory(prisonerId: string, appId: string): Promise<History[] | null> {
    try {
      return await this.restClient.get({
        path: `/v1/prisoners/${prisonerId}/apps/${appId}/history`,
      })
    } catch (error) {
      logger.error(`Failed to fetch history for prisoner ${prisonerId} on app ${appId}`, error)
      return null
    }
  }

  async addResponse(prisonerId: string, appId: string, payload: AppResponsePayload): Promise<void> {
    try {
      await this.restClient.post({
        path: `/v1/prisoners/${prisonerId}/apps/${appId}/responses`,
        data: payload,
      })
    } catch (error) {
      logger.error(`Error adding response to application.`, error)
    }
  }

  async getResponse(prisonerId: string, appId: string, responseId: string): Promise<Response> {
    try {
      return await this.restClient.get({
        path: `/v1/prisoners/${prisonerId}/apps/${appId}/responses/${responseId}?createdBy=true`,
      })
    } catch (error) {
      logger.error(`Error fetching response for application.`, error)
      return null
    }
  }

  async changeApp(
    prisonerId: string,
    appId: string,
    payload: {
      firstNightCenter: boolean
      formData: Array<Record<string, unknown> & { id: string }>
    },
  ): Promise<Response> {
    try {
      return await this.restClient.put({
        path: `/v1/prisoners/${prisonerId}/apps/${appId}`,
        data: payload,
      })
    } catch (error) {
      logger.error(`Error fetching response for application.`, error)
      return null
    }
  }

  async getAppTypes(): Promise<AppTypeResponse[] | null> {
    try {
      return await this.restClient.get({
        path: `/v1/establishments/apps/types`,
      })
    } catch (error) {
      logger.error(`Error fetching application types.`, error)
      return null
    }
  }

  async getDepartments(_appTypeId: string): Promise<Department[]> {
    try {
      // return await this.restClient.get({
      //   path: `/v1/groups/app/types/${appType}`,
      // })
      return [
        {
          id: '916267ad-3ba6-4826-8d59-01cfbaa8420b',
          name: 'Business Hub',
          establishment: {
            id: 'TEST_ESTABLISHMENT_FIRST',
            name: 'TEST_ESTABLISHMENT_FIRST',
            appTypes: ['PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT'],
            defaultDepartments: false,
          },
          initialApp: 'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT',
          type: 'WING',
        },
        {
          id: '5cee45c0-1751-41b3-8257-9cfe312cbdec',
          name: 'OMU',
          establishment: {
            id: 'TEST_ESTABLISHMENT_FIRST',
            name: 'TEST_ESTABLISHMENT_FIRST',
            appTypes: ['PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT'],
            defaultDepartments: false,
          },
          initialApp: 'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT',
          type: 'WING',
        },
      ]
    } catch (error) {
      logger.error(`Error fetching department list.`, error)
      return null
    }
  }

  async getGroupsAndTypes(): Promise<Group[] | null> {
    try {
      return await this.restClient.get({
        path: `/v2/establishments/apps/groups`,
      })
    } catch (error) {
      logger.error(`Error fetching application groups and types.`, error)
      return null
    }
  }
}
