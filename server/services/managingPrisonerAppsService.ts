import { ApplicationData } from 'express-session'
import { ApplicationSearchPayload, AppResponsePayload } from '../@types/managingAppsApi'
import { HmppsAuthClient } from '../data'
import ManagingPrisonerAppsApiClient from '../data/managingPrisonerAppsClient'
import { BaseUser } from '../interfaces/hmppsUser'

export default class ManagingPrisonerAppsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getActiveAgencies(): Promise<string[]> {
    return this.getSupportedPrisonIds(undefined)
  }

  async getSupportedPrisonIds(username: string): Promise<string[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new ManagingPrisonerAppsApiClient(token).getActiveAgencies()
  }

  async getPrisonerApp(prisonerId: string, applicationId: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getPrisonerApp(prisonerId, applicationId)
  }

  async forwardApp(applicationId: string, groupId: string, user: BaseUser, message?: string) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).forwardApp(applicationId, groupId, message)
  }

  async submitPrisonerApp(applicationData: ApplicationData, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).submitPrisonerApp(applicationData)
  }

  async getApps(payload: ApplicationSearchPayload, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getApps(payload)
  }

  async searchPrisoners(query: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).searchPrisoners(query)
  }

  async addComment(
    prisonerId: string,
    applicationId: string,
    payload: { message: string; targetUsers: { id: string }[] },
    user: BaseUser,
  ) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).addComment(prisonerId, applicationId, payload)
  }

  async getComments(prisonerId: string, applicationId: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getComments(prisonerId, applicationId)
  }

  async addResponse(prisonerId: string, applicationId: string, payload: AppResponsePayload, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).addResponse(prisonerId, applicationId, payload)
  }

  async getResponse(prisonerId: string, applicationId: string, responseId: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getResponse(prisonerId, applicationId, responseId)
  }

  async getHistory(prisonerId: string, applicationId: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getHistory(prisonerId, applicationId)
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
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).changeApp(prisonerId, applicationId, payload)
  }

  async getAppTypes(user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getAppTypes()
  }

  async getDepartments(user: BaseUser, appType: string) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getDepartments(appType)
  }
}
