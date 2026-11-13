import { ResidentialLocation } from '../@types/locationsInsidePrisonApi'

export type PrisonLocation = ResidentialLocation

export interface LocationFilterOption {
  value: string
  text: string
  checked: boolean
  subLocations: LocationFilterOption[]
}

const formatLocationLabel = (location: PrisonLocation): string => {
  const typeLabel = location.locationType.toLowerCase().replace(/^./, firstLetter => firstLetter.toUpperCase())
  return `${location.fullLocationPath} ${typeLabel}`
}

export const formatLocationFilterOptions = (
  locations: PrisonLocation[],
  selectedLocationIds: string[] = [],
): LocationFilterOption[] =>
  locations
    .filter(location => location.status === 'ACTIVE')
    .map(location => {
      const activeSubLocations = (location.subLocations ?? []).filter(subLocation => subLocation.status === 'ACTIVE')
      const parentSelected = selectedLocationIds.includes(location.locationId)
      const hasExplicitSubLocationSelection = activeSubLocations.some(subLocation =>
        selectedLocationIds.includes(subLocation.locationId),
      )

      return {
        value: location.locationId,
        text: formatLocationLabel(location),
        checked: parentSelected,
        subLocations: activeSubLocations.map(subLocation => ({
          value: subLocation.locationId,
          text: formatLocationLabel(subLocation),
          checked:
            selectedLocationIds.includes(subLocation.locationId) ||
            (parentSelected && !hasExplicitSubLocationSelection),
          subLocations: [] as LocationFilterOption[],
        })),
      }
    })
