import { ApplicationData } from 'express-session'
import { ApplicationSearchPayload } from '../@types/managingAppsApi'
import { HmppsAuthClient } from '../data'
import ManagingPrisonerAppsApiClient from '../data/managingPrisonerAppsClient'
import { BaseUser } from '../interfaces/hmppsUser'

export default class ManagingPrisonerAppsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getPrisonerApp(prisonerId: string, applicationId: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getPrisonerApp(prisonerId, applicationId)
  }

  async forwardApp(applicationId: string, groupId: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).forwardApp(applicationId, groupId)
  }

  async submitPrisonerApp(applicationData: ApplicationData, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).submitPrisonerApp(applicationData)
  }

  async getApps(payload: ApplicationSearchPayload, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getApps(payload)
  }

  async getGroups(user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getGroups()
  }

  async searchPrisoners(query: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).searchPrisoners(query)
  }
}
