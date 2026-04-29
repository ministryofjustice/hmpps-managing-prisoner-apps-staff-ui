import PrisonApiClient from '../data/prisonApiClient'

export default class PrisonService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  async getPrisonerByPrisonNumber(username: string, prisonNumber: string) {
    return this.prisonApiClient.getPrisonerByPrisonNumber(username, prisonNumber)
  }

  async getCurrentUserCaseloads(username: string) {
    return this.prisonApiClient.getCurrentUserCaseloads(username)
  }
}
