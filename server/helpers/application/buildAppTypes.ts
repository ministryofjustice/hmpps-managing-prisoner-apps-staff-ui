import { Group } from '../../@types/managingAppsApi'

export type AppTypeItem = { value: string; text: string; checked: boolean } | { divider: 'or' }

export const buildAppTypes = (group: Group, selectedValue: string | null): AppTypeItem[] => {
  const items: AppTypeItem[] = []

  const genericAppTypes = group.appTypes.filter(appType => appType.genericType)
  const nonGenericAppTypes = group.appTypes.filter(appType => !appType.genericType)

  nonGenericAppTypes.forEach(appType => {
    items.push({
      value: appType.id.toString(),
      text: appType.name,
      checked: selectedValue === appType.id.toString(),
    })
  })

  if (genericAppTypes.length === 1 && nonGenericAppTypes.length > 0) {
    items.push({ divider: 'or' })
  }

  if (genericAppTypes.length > 0) {
    genericAppTypes.forEach(appType => {
      items.push({
        value: appType.id.toString(),
        text: appType.name,
        checked: selectedValue === appType.id.toString(),
      })
    })
  }

  return items
}
