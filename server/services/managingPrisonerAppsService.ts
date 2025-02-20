import { Request } from 'express'
import { HmppsAuthClient } from '../data'
import { User } from '../data/hmppsManageUsersClient'
import ManagingPrisonerAppsApiClient from '../data/managingPrisonerAppsClient'

export default class ManagingPrisonerAppsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getPrisonerApp(applicationId: string, prisonerId: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getPrisonerApp(applicationId, prisonerId)
  }

  async submitPrisonerApp(prisonerId: string, user: User, req: Request) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)

    const data = req.session.applicationData?.additionalData?.swapVOsToPinCreditDetails
    if (!data) {
      throw new Error('No application data found in session')
    }

    return new ManagingPrisonerAppsApiClient(token).submitPrisonerApp(prisonerId, {
      swapVOsToPinCreditDetails: data,
    })
  }
}
