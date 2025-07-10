import { APPLICATION_TYPE_VALUES, applicationTypeLabels } from '../../constants/applicationTypes'
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
    getAppTypes: jest.fn(),
  } as unknown as jest.Mocked<ManagingPrisonerAppsService>

  it('should return the requested application type', async () => {
    managingPrisonerAppsService.getAppTypes.mockResolvedValue(new TestData().appTypes)

    const appType = await getAppType(managingPrisonerAppsService, mockUser, 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT')

    expect(appType).toEqual({
      key: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
      name: applicationTypeLabels.PIN_PHONE_ADD_NEW_SOCIAL_CONTACT,
      value: APPLICATION_TYPE_VALUES.PIN_PHONE_ADD_NEW_SOCIAL_CONTACT,
    })
  })
})
