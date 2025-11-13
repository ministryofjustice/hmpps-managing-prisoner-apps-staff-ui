import { HmppsUser } from '../../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { appTypeIdToLegacyKeyMap } from '../../testData/appTypes'

// eslint-disable-next-line import/prefer-default-export
export const formatAppTypesForFilters = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  applicationTypes: Record<string, { id: number; name: string; count: number }>,
  selectedFilters: { types: string[] },
) => {
  const appTypes = await managingPrisonerAppsService.getAppTypes(user)
  return Object.entries(applicationTypes)
    .filter(([, value]) => value.count > 0)
    .map(([_, value]) => {
      const serviceKey = appTypeIdToLegacyKeyMap[value.id]
      if (!serviceKey) return null

      const matchingType = appTypes.find(type => type.key === serviceKey)
      if (!matchingType) return null

      return {
        value: value.id.toString(),
        text: `${matchingType.name} (${value.count})`,
        checked: selectedFilters.types.includes(value.id.toString()),
      }
    })
    .filter(Boolean)
}
