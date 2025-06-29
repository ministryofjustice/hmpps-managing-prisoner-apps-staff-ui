export interface RelationshipDropdownList {
  value: string
  text: string
  selected?: boolean
}

export function relationshipDropdownOptions(
  data: { code: string; description: string }[],
  defaultText = 'Select a relationship',
  selectedValue?: string,
): RelationshipDropdownList[] {
  return [
    { value: '', text: defaultText, selected: !selectedValue },
    ...data.map(item => ({
      value: item.code,
      text: item.description,
      selected: item.code === selectedValue,
    })),
  ]
}
