import { ViewAppListAssignedGroup } from '../../@types/managingAppsApi'

// eslint-disable-next-line import/prefer-default-export
export const formatGroupsForFilters = (
  assignedGroups: ViewAppListAssignedGroup[],
  selectedFilters: { groups: string[] },
) =>
  assignedGroups.map(group => ({
    value: group.id,
    text: `${group.name} (${group.count})`,
    checked: selectedFilters.groups.includes(group.id),
  }))
