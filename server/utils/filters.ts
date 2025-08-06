import { Request } from 'express'
import { ParsedQs } from 'qs'

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

type SelectedFilters = {
  groups: string[]
  priority: string[]
  prisonerId: string
  prisonerLabel: string
  types: string[]
}

type SelectedFilterTags = {
  groups: LinkText[]
  priority: LinkText[]
  types: LinkText[]
}

type LinkText = {
  href: string
  text: string
}

export const checkSelectedFilters = (
  selectedFilters: SelectedFilters,
  selectedFilterTags: SelectedFilterTags,
): boolean =>
  Boolean(
    selectedFilters.prisonerId ||
      selectedFilterTags.groups.length > 0 ||
      selectedFilterTags.types.length > 0 ||
      selectedFilterTags.priority.length > 0,
  )
