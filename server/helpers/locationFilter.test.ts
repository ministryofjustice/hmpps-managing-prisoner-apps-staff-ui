import { formatLocationFilterOptions, PrisonLocation } from './locationFilter'

describe(formatLocationFilterOptions.name, () => {
  const locations: PrisonLocation[] = [
    {
      locationId: 'wing-a',
      locationType: 'WING',
      locationCode: 'A',
      fullLocationPath: 'A',
      level: 1,
      status: 'ACTIVE',
      subLocations: [
        {
          locationId: 'landing-a1',
          locationType: 'LANDING',
          locationCode: '1',
          fullLocationPath: 'A-1',
          level: 2,
          status: 'ACTIVE',
          subLocations: [
            {
              locationId: 'cell-a1-001',
              locationType: 'CELL',
              locationCode: '001',
              fullLocationPath: 'A-1-001',
              level: 3,
              status: 'ACTIVE',
            },
          ],
        },
        {
          locationId: 'landing-a2',
          locationType: 'LANDING',
          locationCode: '2',
          fullLocationPath: 'A-2',
          level: 2,
          status: 'INACTIVE',
        },
      ],
    },
  ]

  it('formats active wings and landings only and marks selected values', () => {
    expect(formatLocationFilterOptions(locations, ['landing-a1'])).toEqual([
      {
        value: 'wing-a',
        text: 'A Wing',
        checked: false,
        subLocations: [
          {
            value: 'landing-a1',
            text: 'A-1 Landing',
            checked: true,
            subLocations: [],
          },
        ],
      },
    ])
  })

  it('includes an active top-level location without sublocations', () => {
    const standaloneLocation: PrisonLocation = {
      ...locations[0],
      locationId: 'court',
      locationCode: 'COURT',
      fullLocationPath: 'COURT',
      subLocations: [],
    }

    expect(formatLocationFilterOptions([standaloneLocation])).toEqual([
      { value: 'court', text: 'COURT Wing', checked: false, subLocations: [] },
    ])
  })

  it('keeps a selected parent checked while showing a partial child selection', () => {
    const locationsWithTwoActiveSubLocations: PrisonLocation[] = [
      {
        ...locations[0],
        subLocations: [
          ...(locations[0].subLocations ?? []).filter(subLocation => subLocation.status === 'ACTIVE'),
          {
            locationId: 'landing-a3',
            locationType: 'LANDING',
            locationCode: '3',
            fullLocationPath: 'A-3',
            level: 2,
            status: 'ACTIVE',
          },
        ],
      },
    ]

    expect(formatLocationFilterOptions(locationsWithTwoActiveSubLocations, ['wing-a', 'landing-a1'])).toEqual([
      {
        value: 'wing-a',
        text: 'A Wing',
        checked: true,
        subLocations: [
          { value: 'landing-a1', text: 'A-1 Landing', checked: true, subLocations: [] },
          { value: 'landing-a3', text: 'A-3 Landing', checked: false, subLocations: [] },
        ],
      },
    ])
  })

  it('shows active children as checked when their parent is selected', () => {
    const [wing] = formatLocationFilterOptions(locations, ['wing-a'])

    expect(wing.checked).toBe(true)
    expect(wing.subLocations[0].checked).toBe(true)
  })
})
