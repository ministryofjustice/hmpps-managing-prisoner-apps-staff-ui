import { HmppsAuthClient } from '../data'
import { HmppsUser } from '../interfaces/hmppsUser'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { legacyAppTypes } from '../testData/appTypes'
import { formatAppsToRows } from './apps'

jest.mock('../helpers/application/getLegacyAppType', () => ({
  getLegacyAppType: jest.fn(() => legacyAppTypes[2]),
}))

describe('formatAppsToRows', () => {
  let managingPrisonerAppsService: ManagingPrisonerAppsService

  const mockGetSystemClientToken = jest.fn()

  const mockUser: HmppsUser = {
    ...new TestData().user,
    authSource: 'nomis',
    staffId: 12345,
  }

  beforeEach(() => {
    const mockHmppsAuthClient = {
      getSystemClientToken: mockGetSystemClientToken,
    } as unknown as jest.Mocked<HmppsAuthClient>

    managingPrisonerAppsService = new ManagingPrisonerAppsService(mockHmppsAuthClient)
  })

  it('should correctly format applications', async () => {
    const applications = [
      {
        ...new TestData().appSearchResponse.apps[0],
        prisonerName: 'Doe, John',
      },
    ]

    const result = await formatAppsToRows(managingPrisonerAppsService, mockUser, applications)

    expect(result).toEqual([
      [
        { text: '24 March 2025', attributes: { 'data-sort-value': '1742824993000' }, classes: 'govuk-!-text-nowrap' },
        { text: 'Add an official PIN phone contact' },
        { html: 'Doe, John<br/><span class="govuk-table__subtext govuk-body-s">A12345</span>' },
        { text: 'Business Hub' },
        { html: '<a href="/applications/A12345/1808f5e2-2bf4-499a-b79f-fb0a5f4bac7b" class="govuk-link">View</a>' },
      ],
    ])
  })
})
