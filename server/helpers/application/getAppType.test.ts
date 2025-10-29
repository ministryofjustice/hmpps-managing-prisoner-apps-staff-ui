import { HmppsUser } from '../../interfaces/hmppsUser'
import TestData from '../../routes/testutils/testData'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { groups } from '../../testData/groups'
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

  it('should return the requested application type by ID', async () => {
    managingPrisonerAppsService.getGroupsAndTypes.mockResolvedValue(groups)

    const appType = await getAppType(managingPrisonerAppsService, mockUser, '2')

    expect(appType).toEqual({
      id: 2,
      name: 'Add new official PIN phone contact',
      genericType: false,
      logDetailRequired: false,
    })
  })
})
