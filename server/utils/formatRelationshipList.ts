import PersonalRelationshipsService from '../services/personalRelationshipsService'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'
import { relationshipDropdownOptions, RelationshipDropdownList } from './personalRelationshipList'

// eslint-disable-next-line import/prefer-default-export
export async function getFormattedRelationshipDropdown(
  personalRelationshipsService: PersonalRelationshipsService,
  selectedValue?: string,
  groupCode: string = PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP,
): Promise<RelationshipDropdownList[]> {
  const relationshipList = await personalRelationshipsService.relationshipList(groupCode)
  return relationshipDropdownOptions(relationshipList, 'Select a relationship', selectedValue)
}
