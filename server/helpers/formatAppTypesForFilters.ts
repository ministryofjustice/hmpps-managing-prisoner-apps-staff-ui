import { HmppsUser } from '../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'

type FilterOption = {
  value: string
  text: string
  checked: boolean
}

// eslint-disable-next-line import/prefer-default-export
export const formatAppTypesForFilters = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  types: Record<string, number>,
  selectedFilters: { types: string[] },
): Promise<FilterOption[]> => {
  const appTypes = await managingPrisonerAppsService.getAppTypes(user)

  return Object.entries(types)
    .map(([key, count]) => {
      const matchingType = appTypes.find(type => type.key === key)
      if (!matchingType) return null

      return {
        value: matchingType.key,
        text: `${matchingType.name} (${count})`,
        checked: selectedFilters.types.includes(matchingType.key),
      }
    })
    .filter((item): item is FilterOption => Boolean(item))
}
