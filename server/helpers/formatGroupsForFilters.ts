// eslint-disable-next-line import/prefer-default-export
export const formatGroupsForFilters = (
  assignedGroups: { id: string; name: string; count: number }[],
  selectedFilters: { groups: string[] },
) =>
  assignedGroups.map(group => ({
    value: group.id,
    text: `${group.name} (${group.count})`,
    checked: selectedFilters.groups.includes(group.id),
  }))
