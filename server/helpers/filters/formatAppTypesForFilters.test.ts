import { HmppsUser } from '../../interfaces/hmppsUser'
import TestData from '../../routes/testutils/testData'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { legacyAppTypes } from '../../testData/appTypes'
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
    PIN_PHONE_EMERGENCY_CREDIT_TOP_UP: 5,
    PIN_PHONE_ADD_NEW_SOCIAL_CONTACT: 9,
    PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: 4,
    PIN_PHONE_SUPPLY_LIST_OF_CONTACTS: 2,
  }

  beforeEach(() => managingPrisonerAppsService.getAppTypes.mockResolvedValue(legacyAppTypes))
  afterEach(() => jest.clearAllMocks())

  it('formats app types correctly when no filters are selected', async () => {
    const selectedFilters: { types: string[] } = { types: [] }

    const result = await formatAppTypesForFilters(managingPrisonerAppsService, mockUser, mockTypes, selectedFilters)

    const expected = Object.entries(mockTypes)
      .map(([key, count]) => {
        const matchingType = legacyAppTypes.find(type => type.key === key)
        if (!matchingType) return null

        return {
          value: matchingType.key,
          text: `${matchingType.name} (${count})`,
          checked: false,
        }
      })
      .filter(Boolean)

    expect(result).toEqual(expected)
  })

  it('marks selected types as checked', async () => {
    const selectedFilters = {
      types: ['PIN_PHONE_EMERGENCY_CREDIT_TOP_UP', 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT'],
    }

    const result = await formatAppTypesForFilters(managingPrisonerAppsService, mockUser, mockTypes, selectedFilters)

    selectedFilters.types.forEach(typeKey => {
      const found = result.find(r => r.value === typeKey)
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
    }

    const result = await formatAppTypesForFilters(managingPrisonerAppsService, mockUser, modifiedTypes, {
      types: [],
    })

    expect(result.find(r => r.value === 'NON_EXISTENT_KEY')).toBeUndefined()
  })
})
