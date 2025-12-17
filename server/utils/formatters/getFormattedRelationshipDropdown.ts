import PersonalRelationshipsService from '../../services/personalRelationshipsService'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../../constants/personalRelationshipsGroupCodes'

export interface RelationshipOption {
  value: string
  text: string
  selected?: boolean
}

export interface RawRelationship {
  code: string
  description: string
  isActive: boolean
}

const DEFAULT_PLACEHOLDER_TEXT = 'Select a relationship'
const DEFAULT_GROUP_CODE = 'SOCIAL_RELATIONSHIP'

const createPlaceholderOption = (text: string, isSelected: boolean): RelationshipOption => ({
  value: '',
  text,
  selected: isSelected,
})

const mapToRelationshipOption = (relationship: RawRelationship, selectedValue?: string): RelationshipOption => ({
  value: relationship.description,
  text: relationship.description,
  selected: relationship.description === selectedValue,
})

export const formatRelationshipList = (
  relationships: RawRelationship[],
  defaultText: string,
  selectedValue?: string,
): RelationshipOption[] => {
  const activeRelationships = relationships
    .filter(relationship => relationship.isActive)
    .map(relationship => mapToRelationshipOption(relationship, selectedValue))

  const placeholder = createPlaceholderOption(defaultText, !selectedValue)

  return [placeholder, ...activeRelationships]
}

export default async function getFormattedRelationshipDropdown(
  personalRelationshipsService: PersonalRelationshipsService,
  selectedValue?: string,
  groupCode: keyof typeof PERSONAL_RELATIONSHIPS_GROUP_CODES = DEFAULT_GROUP_CODE,
): Promise<RelationshipOption[]> {
  const groupCodeValue = PERSONAL_RELATIONSHIPS_GROUP_CODES[groupCode]
  const relationships = await personalRelationshipsService.getRelationships(groupCodeValue)

  return formatRelationshipList(relationships, DEFAULT_PLACEHOLDER_TEXT, selectedValue)
}
