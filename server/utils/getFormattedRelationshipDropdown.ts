import PersonalRelationshipsService from '../services/personalRelationshipsService'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'

interface RelationshipOption {
  value: string
  text: string
  selected?: boolean
}

interface RawRelationship {
  code: string
  description: string
  isActive: boolean
}

function formatRelationshipList(
  relationships: RawRelationship[],
  defaultText: string,
  selectedValue?: string,
): RelationshipOption[] {
  const options: RelationshipOption[] = relationships
    .filter(({ isActive }) => isActive)
    .map(({ description }) => ({
      value: description,
      text: description,
      selected: description === selectedValue,
    }))

  return [{ value: '', text: defaultText, selected: !selectedValue }, ...options]
}

async function getFormattedRelationshipDropdown(
  personalRelationshipsService: PersonalRelationshipsService,
  selectedValue?: string,
  groupCode: keyof typeof PERSONAL_RELATIONSHIPS_GROUP_CODES = 'SOCIAL_RELATIONSHIP',
): Promise<RelationshipOption[]> {
  const relationships = await personalRelationshipsService.getRelationships(
    PERSONAL_RELATIONSHIPS_GROUP_CODES[groupCode],
  )

  return formatRelationshipList(relationships, 'Select a relationship', selectedValue)
}

export default getFormattedRelationshipDropdown
