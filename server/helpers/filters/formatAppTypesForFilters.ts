// eslint-disable-next-line import/prefer-default-export
export const formatAppTypesForFilters = (
  applicationTypes: Record<string, { id: number; name: string; count: number }>,
  selectedFilters: { types: string[] },
) => {
  return Object.entries(applicationTypes)
    .filter(([_, value]) => value.count > 0)
    .map(([_, value]) => ({
      value: value.id.toString(),
      text: `${value.name} (${value.count})`,
      checked: selectedFilters.types.includes(value.id.toString()),
    }))
}
