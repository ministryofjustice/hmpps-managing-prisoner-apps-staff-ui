import { appListAssignedGroups } from '../../testData'
import { formatGroupsForFilters } from './formatGroupsForFilters'

describe(formatGroupsForFilters.name, () => {
  it('formats groups correctly when no filters are selected', () => {
    const selectedFilters: { groups: string[] } = { groups: [] }
    const result = formatGroupsForFilters(appListAssignedGroups, selectedFilters)

    const expected = appListAssignedGroups.map(group => ({
      value: group.id,
      text: `${group.name} (${group.count})`,
      checked: false,
    }))

    expect(result).toEqual(expected)
  })

  it('marks only selected groups as checked', () => {
    const selectedFilters = {
      groups: [appListAssignedGroups[1].id, appListAssignedGroups[2].id],
    }
    const result = formatGroupsForFilters(appListAssignedGroups, selectedFilters)

    expect(result.find(group => group.value === appListAssignedGroups[1].id)?.checked).toBe(true)
    expect(result.find(group => group.value === appListAssignedGroups[2].id)?.checked).toBe(true)
    expect(result.find(group => group.value === appListAssignedGroups[3].id)?.checked).toBe(false)
  })

  it('returns an empty array if assignedGroups is empty', () => {
    const selectedFilters = { groups: ['some-group-id'] }
    const result = formatGroupsForFilters([], selectedFilters)
    expect(result).toEqual([])
  })
})
