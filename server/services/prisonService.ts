import { HmppsAuthClient } from '../data'
import PrisonApiClient from '../data/prisonClient'
import { BaseUser } from '../interfaces/hmppsUser'

export default class PrisonService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getPrisonerByPrisonNumber(prisonNumber: string, user: BaseUser) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getPrisonerByPrisonNumber(prisonNumber)
  }
}
