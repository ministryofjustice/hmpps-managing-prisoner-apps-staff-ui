import { HmppsUser } from '../../interfaces/hmppsUser'
import TestData from '../../routes/testutils/testData'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { legacyAppTypes, appTypeIdToLegacyKeyMap } from '../../testData/appTypes'
import { formatAppTypesForFilters } from './formatAppTypesForFilters'

describe(formatAppTypesForFilters.name, () => {
  const mockUser: HmppsUser = {
    ...new TestData().user,
    authSource: 'nomis',
    staffId: 12345,
  }

  const managingPrisonerAppsService = {
    getAppTypes: jest.fn(),
  } as unknown as jest.Mocked<ManagingPrisonerAppsService>

  const mockTypes = {
    '1': { id: 1, name: 'Add emergency phone credit', count: 5 },
    '2': { id: 2, name: 'Add new social PIN phone contact', count: 9 },
    '3': { id: 3, name: 'Swap visiting orders (VOs) for PIN credit', count: 4 },
    '4': { id: 4, name: 'Supply list of PIN phone contacts', count: 2 },
  }

  beforeEach(() => managingPrisonerAppsService.getAppTypes.mockResolvedValue(legacyAppTypes))
  afterEach(() => jest.clearAllMocks())

  it('formats app types correctly when no filters are selected', async () => {
    const selectedFilters: { types: string[] } = { types: [] }

    const result = await formatAppTypesForFilters(managingPrisonerAppsService, mockUser, mockTypes, selectedFilters)

    expect(result).toEqual(
      expect.arrayContaining(
        Object.values(mockTypes)
          .map(value => {
            const serviceKey = appTypeIdToLegacyKeyMap[value.id]
            const matchingType = legacyAppTypes.find(type => type.key === serviceKey)
            if (!matchingType) return null
            return expect.objectContaining({
              value: value.id.toString(),
              text: `${matchingType.name} (${value.count})`,
              checked: false,
            })
          })
          .filter(Boolean),
      ),
    )
  })

  it('marks selected types as checked', async () => {
    const selectedFilters = {
      types: ['1', '2'],
    }

    const result = await formatAppTypesForFilters(managingPrisonerAppsService, mockUser, mockTypes, selectedFilters)

    selectedFilters.types.forEach(typeValue => {
      const found = result.find(r => r.value === typeValue)
      expect(found?.checked).toBe(true)
    })

    result.filter(r => !selectedFilters.types.includes(r.value)).forEach(r => expect(r.checked).toBe(false))
  })

  it('returns empty array if no matching app types exist', async () => {
    managingPrisonerAppsService.getAppTypes.mockResolvedValue([])

    const result = await formatAppTypesForFilters(managingPrisonerAppsService, mockUser, mockTypes, {
      types: [],
    })

    expect(result).toEqual([])
  })

  it('skips types that do not have a matching appType entry', async () => {
    const modifiedTypes = {
      ...mockTypes,
      NON_EXISTENT_KEY: 3,
    } as unknown as Record<string, { id: number; name: string; count: number }>

    const result = await formatAppTypesForFilters(managingPrisonerAppsService, mockUser, modifiedTypes, {
      types: [],
    })

    expect(result.find(r => r.value === 'NON_EXISTENT_KEY')).toBeUndefined()
  })
})
