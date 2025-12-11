import { HmppsUser } from '../../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { groups } from '../../testData/groups/groups'
import { getAppType } from './getAppType'

describe(getAppType.name, () => {
  const managingPrisonerAppsService = {
    getGroupsAndTypes: jest.fn(),
  } as unknown as jest.Mocked<ManagingPrisonerAppsService>

  it('should return the requested application type by ID', async () => {
    managingPrisonerAppsService.getGroupsAndTypes.mockResolvedValue(groups)

    const appType = await getAppType(managingPrisonerAppsService, {} as HmppsUser, '2')

    expect(appType).toEqual(groups[0].appTypes[1])
  })
})
