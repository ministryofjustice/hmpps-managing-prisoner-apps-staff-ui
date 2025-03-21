import { ApplicationData } from 'express-session'
import { HmppsAuthClient } from '../data'
import ManagingPrisonerAppsApiClient from '../data/managingPrisonerAppsClient'
import { BaseUser } from '../interfaces/hmppsUser'

export default class ManagingPrisonerAppsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getPrisonerApp(prisonerId: string, applicationId: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getPrisonerApp(prisonerId, applicationId)
  }

  async forwardApp(prisonerId: string, applicationId: string, department: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).forwardApp(prisonerId, applicationId, department)
  }

  async submitPrisonerApp(applicationData: ApplicationData, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).submitPrisonerApp(applicationData)
  }
}
