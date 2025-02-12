import { HmppsAuthClient, RestClientBuilder } from '../data'
import PrisonApiClient from '../data/api/prisonApiClient'

export default class PrisonService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly prisonApiClientFactory: RestClientBuilder<PrisonApiClient>,
  ) {}

  async getPrisonerByPrisonNumber(prisonNumber: string): Promise<{ firstName: string; lastName: string }> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const prisonApiClient = this.prisonApiClientFactory(token)

    const prisoner = await prisonApiClient.getPrisonerByPrisonNumber(prisonNumber)
    return {
      firstName: prisoner.firstName,
      lastName: prisoner.lastName,
    }
  }
}
