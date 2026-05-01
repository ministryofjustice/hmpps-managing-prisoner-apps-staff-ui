import { ApplicationData } from 'express-session'
import { ApplicationSearchPayload, AppResponsePayload } from '../@types/managingAppsApi'
import ManagingPrisonerAppsApiClient from '../data/managingPrisonerAppsApiClient'
import { BaseUser } from '../interfaces/hmppsUser'

export default class ManagingPrisonerAppsService {
  constructor(private readonly managingPrisonerAppsApiClient: ManagingPrisonerAppsApiClient) {}

  async getActiveAgencies(): Promise<string[]> {
    return this.managingPrisonerAppsApiClient.getActiveAgencies()
  }

  async getPrisonerApp(prisonerId: string, applicationId: string, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.getPrisonerApp(user.username, prisonerId, applicationId)
  }

  async forwardApp(applicationId: string, groupId: string, user: BaseUser, message?: string) {
    return this.managingPrisonerAppsApiClient.forwardApp(user.username, applicationId, groupId, message)
  }

  async submitPrisonerApp(applicationData: ApplicationData, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.submitPrisonerApp(user.username, applicationData)
  }

  async getApps(payload: ApplicationSearchPayload, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.getApps(user.username, payload)
  }

  async searchPrisoners(query: string, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.searchPrisoners(user.username, query)
  }

  async addComment(
    prisonerId: string,
    applicationId: string,
    payload: { message: string; targetUsers: { id: string }[] },
    user: BaseUser,
  ) {
    return this.managingPrisonerAppsApiClient.addComment(user.username, prisonerId, applicationId, payload)
  }

  async getComments(prisonerId: string, applicationId: string, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.getComments(user.username, prisonerId, applicationId)
  }

  async addResponse(prisonerId: string, applicationId: string, payload: AppResponsePayload, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.addResponse(user.username, prisonerId, applicationId, payload)
  }

  async getResponse(prisonerId: string, applicationId: string, responseId: string, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.getResponse(user.username, prisonerId, applicationId, responseId)
  }

  async getHistory(prisonerId: string, applicationId: string, user: BaseUser) {
    return this.managingPrisonerAppsApiClient.getHistory(user.username, prisonerId, applicationId)
  }

  async changeApp(
    prisonerId: string,
    applicationId: string,
    payload: {
      firstNightCenter: boolean
      formData: Array<Record<string, unknown> & { id: string }>
    },
    user: BaseUser,
  ) {
    return this.managingPrisonerAppsApiClient.changeApp(user.username, prisonerId, applicationId, payload)
  }

  async getAppTypes(user: BaseUser) {
    return this.managingPrisonerAppsApiClient.getAppTypes(user.username)
  }

  async getDepartments(user: BaseUser, appType: string) {
    return this.managingPrisonerAppsApiClient.getDepartments(user.username, appType)
  }

  async getGroupsAndTypes(user: BaseUser) {
    return this.managingPrisonerAppsApiClient.getGroupsAndTypes(user.username)
  }
}
