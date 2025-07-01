import { HmppsAuthClient } from '../data'
import PersonalRelationshipsApiClient from '../data/personalRelationshipsClient'

export default class PersonalRelationshipsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async relationshipList(groupCode: string) {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const dropDownList = await new PersonalRelationshipsApiClient(token).relationshipList(groupCode)

    if (!dropDownList) {
      return []
    }

    return dropDownList
      .filter(item => item.isActive)
      .map(item => ({
        code: item.code,
        description: item.description,
      }))
  }
}
