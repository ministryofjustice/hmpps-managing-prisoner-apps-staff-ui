import { HmppsUser } from '../../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

// eslint-disable-next-line import/prefer-default-export
export const getAppType = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  appTypeId: string,
) => {
  const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
  const allAppTypes = groups.flatMap(group => group.appTypes)
  return allAppTypes.find(type => type.id.toString() === appTypeId)
}
