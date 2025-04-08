import { Request } from 'express'
import { ParsedQs } from 'qs'

import { APPLICATION_TYPES } from '../constants/applicationTypes'

export const removeFilterFromHref = (req: Request, filterKey: string, valueToRemove: string) => {
  const newQuery = new URLSearchParams(req.query as Record<string, string | string[]>)

  newQuery.delete(filterKey)

  const queryValues = req.query[filterKey]

  if (queryValues) {
    const valuesArray = Array.isArray(queryValues) ? queryValues : [queryValues as string]
    valuesArray.filter(value => value !== valueToRemove).forEach(value => newQuery.append(filterKey, value as string))
  }

  return `/applications?${newQuery.toString()}`
}

export const extractQueryParamArray = (
  param: string | string[] | ParsedQs | (string | ParsedQs)[] | undefined,
): string[] => {
  if (Array.isArray(param)) {
    return param.map(item => String(item))
  }
  if (typeof param === 'string') {
    return [param]
  }
  if (param && typeof param === 'object' && 'toString' in param) {
    return [String(param)]
  }
  return []
}

export const formatAppTypes = (types: Record<string, number>, selectedFilters: { types: string[] }) => {
  return Object.entries(types)
    .map(([apiValue, count]) => {
      const matchingType = APPLICATION_TYPES.find(type => type.apiValue === apiValue)

      return matchingType
        ? {
            value: matchingType.apiValue,
            text: `${matchingType.name} (${count})`,
            checked: selectedFilters.types.includes(matchingType.apiValue),
          }
        : null
    })
    .filter(Boolean)
}

export const formatGroups = (
  assignedGroups: { id: string; name: string; count: number }[],
  selectedFilters: { groups: string[] },
) =>
  assignedGroups.map(group => ({
    value: group.id,
    text: `${group.name} (${group.count})`,
    checked: selectedFilters.groups.includes(group.id),
  }))
