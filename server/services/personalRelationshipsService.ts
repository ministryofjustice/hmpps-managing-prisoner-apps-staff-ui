import PersonalRelationshipsApiClient from '../data/personalRelationshipsApiClient'

export default class PersonalRelationshipsService {
  constructor(private readonly personalRelationshipsApiClient: PersonalRelationshipsApiClient) {}

  async getRelationships(groupCode: string) {
    const relationships = await this.personalRelationshipsApiClient.getRelationships(groupCode)
    return relationships ?? []
  }
}
