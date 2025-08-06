import { formatPriorityForFilters } from './formatPriorityForFilters'

describe(formatPriorityForFilters.name, () => {
  it('should return the correct format with checked: true when selected', () => {
    const selectedFilters = { priority: ['first-night-centre'] }

    const result = formatPriorityForFilters(selectedFilters, 1)

    expect(result).toEqual([
      {
        value: 'first-night-centre',
        text: 'First night or early days centre (1)',
        checked: true,
      },
    ])
  })

  it('should return the correct format with checked: false when not selected', () => {
    const selectedFilters = { priority: [] as string[] }

    const result = formatPriorityForFilters(selectedFilters, 2)

    expect(result).toEqual([
      {
        value: 'first-night-centre',
        text: 'First night or early days centre (2)',
        checked: false,
      },
    ])
  })

  it('should ignore other unrelated values in the priority array', () => {
    const selectedFilters = { priority: ['some-other-priority'] }

    const result = formatPriorityForFilters(selectedFilters, 3)

    expect(result).toEqual([
      {
        value: 'first-night-centre',
        text: 'First night or early days centre (3)',
        checked: false,
      },
    ])
  })
})
