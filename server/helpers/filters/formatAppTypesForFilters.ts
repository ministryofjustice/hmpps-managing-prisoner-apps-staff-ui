import { HmppsUser } from '../../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

// eslint-disable-next-line import/prefer-default-export
export const formatAppTypesForFilters = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  types: Record<string, number>,
  selectedFilters: { types: string[] },
) => {
  const appTypes = await managingPrisonerAppsService.getAppTypes(user)

  return Object.entries(types)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => {
      const matchingType = appTypes.find(type => type.key === key)
      if (!matchingType) return null

      return {
        value: matchingType.key,
        text: `${matchingType.name} (${count})`,
        checked: selectedFilters.types.includes(matchingType.key),
      }
    })
    .filter(item => Boolean(item))
}
