import PersonalRelationshipsService from '../services/personalRelationshipsService'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'
import { relationshipDropdownOptions, RelationshipDropdownList } from './personalRelationshipList'

// eslint-disable-next-line import/prefer-default-export
export async function getFormattedRelationshipDropdown(
  personalRelationshipsService: PersonalRelationshipsService,
  selectedValue?: string,
): Promise<RelationshipDropdownList[]> {
  const relationshipList = await personalRelationshipsService.relationshipList(
    PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP,
  )
  return relationshipDropdownOptions(relationshipList, 'Select a relationship', selectedValue)
}
