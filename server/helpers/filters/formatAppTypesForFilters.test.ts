import { formatAppTypesForFilters } from './formatAppTypesForFilters'

describe(formatAppTypesForFilters.name, () => {
  const mockTypes = {
    '1': { id: 1, name: 'Add emergency phone credit', count: 5 },
    '2': { id: 2, name: 'Add new social PIN phone contact', count: 9 },
    '3': { id: 3, name: 'Swap visiting orders (VOs) for PIN credit', count: 4 },
    '4': { id: 4, name: 'Supply list of PIN phone contacts', count: 2 },
    '5': { id: 5, name: 'Make a general PIN phone enquiry', count: 0 },
  }

  it('formats app types correctly when no filters are selected', () => {
    const selectedFilters: { types: string[] } = { types: [] }

    const result = formatAppTypesForFilters(mockTypes, selectedFilters)

    expect(result).toEqual(
      expect.arrayContaining([
        { value: '1', text: 'Add emergency phone credit (5)', checked: false },
        { value: '2', text: 'Add new social PIN phone contact (9)', checked: false },
        { value: '3', text: 'Swap visiting orders (VOs) for PIN credit (4)', checked: false },
        { value: '4', text: 'Supply list of PIN phone contacts (2)', checked: false },
      ]),
    )
    expect(result.find(r => r.value === '5')).toBeUndefined()
  })

  it('marks selected types as checked', () => {
    const selectedFilters = {
      types: ['1', '2'],
    }

    const result = formatAppTypesForFilters(mockTypes, selectedFilters)

    expect(result.find(r => r.value === '1')?.checked).toBe(true)
    expect(result.find(r => r.value === '2')?.checked).toBe(true)
    expect(result.find(r => r.value === '3')?.checked).toBe(false)
  })

  it('returns empty array if no matching app types exist', () => {
    const result = formatAppTypesForFilters(
      {},
      {
        types: [],
      },
    )

    expect(result).toEqual([])
  })
})
