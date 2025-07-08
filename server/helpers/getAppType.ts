import { HmppsUser } from '../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'

// eslint-disable-next-line import/prefer-default-export
export const getAppType = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  appType: string,
) => {
  const appTypes = await managingPrisonerAppsService.getAppTypes(user)
  return appTypes.find(type => type.key === appType)
}
