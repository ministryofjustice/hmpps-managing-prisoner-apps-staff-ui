export interface RelationshipDropdownList {
  value: string
  text: string
}

export function relationshipDropdownOptions(
  data: { code: string; description: string }[],
  defaultText = 'Select a relationship',
): RelationshipDropdownList[] {
  return [
    { value: '', text: defaultText },
    ...data.map(item => ({
      value: item.code,
      text: item.description,
    })),
  ]
}
