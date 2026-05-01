import { ApplicationData } from 'express-session'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'
import {
  App,
  AppDecisionResponse,
  ApplicationSearchPayload,
  AppResponsePayload,
  AppTypeResponse,
  Comment,
  CommentsResponse,
  Department,
  Group,
  History,
  PrisonerSearchResult,
  ViewAppsListResponse,
} from '../@types/managingAppsApi'
import config from '../config'

export default class ManagingPrisonerAppsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('managingPrisonerAppsApiClient', config.apis.managingPrisonerApps, logger, authenticationClient)
  }

  async getActiveAgencies(): Promise<string[]> {
    try {
      return await this.get(
        {
          path: `/v1/establishments`,
        },
        asSystem(),
      )
    } catch (error) {
      logger.error(`Error fetching establishments.`, error)
      return null
    }
  }

  async getPrisonerApp(username: string, prisonerId: string, applicationId: string): Promise<App | null> {
    try {
      return await this.get(
        {
          path: `/v1/prisoners/${prisonerId}/apps/${applicationId}?requestedBy=true&assignedGroup=true`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching application for prisonerId: ${prisonerId}, applicationId: ${applicationId}`, error)
      return null
    }
  }

  async forwardApp(username: string, applicationId: string, groupId: string, message?: string): Promise<void> {
    try {
      const payload = {
        message: message?.trim() || '',
      }

      await this.post(
        {
          path: `/v1/apps/${applicationId}/forward/groups/${groupId}`,
          data: payload,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error updating department for applicationId: ${applicationId}, department: ${groupId}`, error)
    }
  }

  async submitPrisonerApp(username: string, applicationData: ApplicationData): Promise<App | null> {
    try {
      const {
        prisonerId,
        type,
        group,
        departmentId,
        earlyDaysCentre,
        additionalData,
        appFile,
        photoAdditionalDetails,
      } = applicationData

      const firstNightCenter =
        typeof earlyDaysCentre === 'string' ? earlyDaysCentre === 'yes' : Boolean(earlyDaysCentre)

      const requestData = {
        ...additionalData,
        ...(photoAdditionalDetails && { details: photoAdditionalDetails }),
      }

      const payload = {
        reference: '',
        type: type.legacyKey,
        applicationType: type.value,
        genericForm: type.genericForm,
        applicationGroup: group.value,
        requests: [requestData],
        firstNightCenter,
        department: departmentId,
        fileRequestDtos: appFile && appFile.length > 0 ? appFile : [],
      }

      return await this.post(
        {
          path: `/v1/prisoners/${prisonerId}/apps`,
          data: payload,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error submitting application for prisonerId: ${applicationData.prisonerId}`, error)
      return null
    }
  }

  async getApps(username: string, payload: ApplicationSearchPayload): Promise<ViewAppsListResponse | null> {
    try {
      return await this.post(
        {
          path: `/v1/prisoners/apps/search`,
          data: payload,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching applications. Payload: ${JSON.stringify(payload)}`, error)
      return null
    }
  }

  async searchPrisoners(username: string, query: string): Promise<PrisonerSearchResult[] | null> {
    try {
      return await this.get(
        {
          path: `/v1/prisoners/search?name=${query}`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error searching prisoners`, error)
      return null
    }
  }

  async addComment(
    username: string,
    prisonerId: string,
    appId: string,
    payload: { message: string; targetUsers: { id: string }[] },
  ): Promise<Comment | null> {
    try {
      return await this.post(
        {
          path: `/v1/prisoners/${prisonerId}/apps/${appId}/comments`,
          data: payload,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Failed to add comment for prisoner ${prisonerId} on app ${appId}`, error)
      return null
    }
  }

  async getComments(
    username: string,
    prisonerId: string,
    appId: string,
    page = 1,
    size = 20,
  ): Promise<CommentsResponse | null> {
    try {
      return await this.get(
        {
          path: `/v1/prisoners/${prisonerId}/apps/${appId}/comments?page=${page}&size=${size}&createdBy=true`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Failed to fetch comments for prisoner ${prisonerId} on app ${appId}`, error)
      return null
    }
  }

  async getHistory(username: string, prisonerId: string, appId: string): Promise<History[] | null> {
    try {
      return await this.get(
        {
          path: `/v1/prisoners/${prisonerId}/apps/${appId}/history`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Failed to fetch history for prisoner ${prisonerId} on app ${appId}`, error)
      return null
    }
  }

  async addResponse(username: string, prisonerId: string, appId: string, payload: AppResponsePayload): Promise<void> {
    try {
      await this.post(
        {
          path: `/v1/prisoners/${prisonerId}/apps/${appId}/responses`,
          data: payload,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error adding response to application.`, error)
    }
  }

  async getResponse(
    username: string,
    prisonerId: string,
    appId: string,
    responseId: string,
  ): Promise<AppDecisionResponse> {
    try {
      return await this.get(
        {
          path: `/v1/prisoners/${prisonerId}/apps/${appId}/responses/${responseId}?createdBy=true`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching response for application.`, error)
      return null
    }
  }

  async changeApp(
    username: string,
    prisonerId: string,
    appId: string,
    payload: {
      firstNightCenter: boolean
      formData: Array<Record<string, unknown> & { id: string }>
    },
  ): Promise<Response> {
    try {
      return await this.put(
        {
          path: `/v1/prisoners/${prisonerId}/apps/${appId}`,
          data: payload,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching response for application.`, error)
      return null
    }
  }

  async getAppTypes(username: string): Promise<AppTypeResponse[] | null> {
    try {
      return await this.get(
        {
          path: `/v1/establishments/apps/types`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching application types.`, error)
      return null
    }
  }

  async getDepartments(username: string, appType: string): Promise<Department[]> {
    try {
      return await this.get(
        {
          path: `/v1/groups/app/types/${appType}`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching department list.`, error)
      return null
    }
  }

  async getGroupsAndTypes(username: string): Promise<Group[] | null> {
    try {
      return await this.get(
        {
          path: `/v2/establishments/apps/groups`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching application groups and types.`, error)
      return null
    }
  }
}
