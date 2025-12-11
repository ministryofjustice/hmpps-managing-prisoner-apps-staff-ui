import { HmppsUser } from '../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { appSearchResponse, user } from '../testData'
import { formatAppsToRows } from './apps'

describe(formatAppsToRows.name, () => {
  let managingPrisonerAppsService: ManagingPrisonerAppsService

  const mockUser: HmppsUser = {
    ...user,
    authSource: 'nomis',
    staffId: 12345,
  }

  beforeEach(() => {
    managingPrisonerAppsService = {
      getGroupsAndTypes: jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Business Hub',
          appTypes: [{ id: 2, name: 'Add new official PIN phone contact' }],
        },
      ]),
    } as unknown as ManagingPrisonerAppsService
  })

  it('should correctly format applications', async () => {
    const applications = [
      {
        ...appSearchResponse.apps[0],
        prisonerName: 'Doe, John',
        appType: { id: 2, name: 'Add new official PIN phone contact' },
      },
    ]

    const result = await formatAppsToRows(managingPrisonerAppsService, mockUser, applications)

    expect(result).toEqual([
      [
        { text: '24 March 2025', attributes: { 'data-sort-value': '1742824993000' }, classes: 'govuk-!-text-nowrap' },
        { text: 'Add new official PIN phone contact' },
        { html: 'Doe, John<br/><span class="govuk-table__subtext govuk-body-s">A12345</span>' },
        { text: 'Business Hub' },
        { html: '<a href="/applications/A12345/1808f5e2-2bf4-499a-b79f-fb0a5f4bac7b" class="govuk-link">View</a>' },
      ],
    ])
  })
})
