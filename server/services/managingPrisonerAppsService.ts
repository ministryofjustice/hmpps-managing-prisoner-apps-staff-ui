import { HmppsAuthClient } from '../data'
import { User } from '../data/hmppsManageUsersClient'
import ManagingPrisonerAppsApiClient from '../data/managingPrisonerAppsClient'

export default class ManagingPrisonerAppsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getPrisonerApp(applicationId: string, prisonerId: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManagingPrisonerAppsApiClient(token).getPrisonerApp(applicationId, prisonerId)
  }
}
