import { HmppsAuthClient } from '../data'
import PersonalRelationshipsApiClient from '../data/personalRelationshipsClient'

export default class PersonalRelationshipsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getRelationships(groupCode: string) {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const relationships = await new PersonalRelationshipsApiClient(token).getRelationships(groupCode)
    return relationships ?? []
  }
}
