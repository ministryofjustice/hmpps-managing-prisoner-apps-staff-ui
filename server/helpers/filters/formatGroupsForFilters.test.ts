import TestData from '../../routes/testutils/testData'
import { formatGroupsForFilters } from './formatGroupsForFilters'

describe(formatGroupsForFilters.name, () => {
  const { assignedGroups } = new TestData()

  it('formats groups correctly when no filters are selected', () => {
    const selectedFilters: { groups: string[] } = { groups: [] }
    const result = formatGroupsForFilters(assignedGroups, selectedFilters)

    const expected = assignedGroups.map(group => ({
      value: group.id,
      text: `${group.name} (${group.count})`,
      checked: false,
    }))

    expect(result).toEqual(expected)
  })

  it('marks only selected groups as checked', () => {
    const selectedFilters = {
      groups: [assignedGroups[1].id, assignedGroups[2].id],
    }
    const result = formatGroupsForFilters(assignedGroups, selectedFilters)

    expect(result.find(group => group.value === assignedGroups[1].id)?.checked).toBe(true)
    expect(result.find(group => group.value === assignedGroups[2].id)?.checked).toBe(true)
    expect(result.find(group => group.value === assignedGroups[3].id)?.checked).toBe(false)
  })

  it('returns an empty array if assignedGroups is empty', () => {
    const selectedFilters = { groups: ['some-group-id'] }
    const result = formatGroupsForFilters([], selectedFilters)
    expect(result).toEqual([])
  })
})
