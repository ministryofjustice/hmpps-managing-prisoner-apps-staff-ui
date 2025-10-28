import { HmppsUser } from '../../interfaces/hmppsUser'
import TestData from '../../routes/testutils/testData'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getAppType } from './getAppType'

const mockUser: HmppsUser = {
  ...new TestData().user,
  authSource: 'nomis',
  staffId: 12345,
}

describe(getAppType.name, () => {
  const managingPrisonerAppsService = {
    getGroupsAndTypes: jest.fn(),
  } as unknown as jest.Mocked<ManagingPrisonerAppsService>

  const mockGroups = [
    {
      id: 1,
      name: 'Pin Phone Contact Apps',
      applicationTypes: [
        {
          id: 2,
          name: 'Add new social PIN phone contact',
          genericType: false,
          logDetailRequired: false,
        },
      ],
    },
  ]

  it('should return the requested application type by ID', async () => {
    managingPrisonerAppsService.getGroupsAndTypes.mockResolvedValue(mockGroups)

    const appType = await getAppType(managingPrisonerAppsService, mockUser, '2')

    expect(appType).toEqual({
      id: 2,
      name: 'Add new social PIN phone contact',
      genericType: false,
      logDetailRequired: false,
    })
  })
})
