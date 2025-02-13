import { HmppsAuthClient, RestClientBuilder } from '../data'
import ManagingPrisonerAppsApiClient from '../data/api/managingPrisonerApps/client'

export default class ManagingPrisonerAppsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly managingPrisonerAppsApiClientFactory: RestClientBuilder<ManagingPrisonerAppsApiClient>,
  ) {}

  async getPrisonerApp(applicationId: string, prisonerId: string) {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const managingPrisonerAppsApiClient = this.managingPrisonerAppsApiClientFactory(token)
    return managingPrisonerAppsApiClient.getPrisonerApp(applicationId, prisonerId)
  }
}
