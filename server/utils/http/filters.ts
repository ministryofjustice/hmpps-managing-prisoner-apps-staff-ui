import { NextFunction, Request, Response } from 'express'
import { ListFilters } from 'express-session'
import { ParsedQs } from 'qs'
import { ViewAppListAssignedGroup } from '../../@types/managingAppsApi'
import { FILTER_KEYS } from '../../constants/filters'
import { formatAppTypesForFilters } from '../../helpers/filters/formatAppTypesForFilters'
import { formatGroupsForFilters } from '../../helpers/filters/formatGroupsForFilters'
import { formatPriorityForFilters } from '../../helpers/filters/formatPriorityForFilters'

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

export const checkSelectedFilters = (selectedFilters: SelectedFilters, selectedFilterTags: SelectedFilterTags) => {
  const { prisonerId } = selectedFilters
  const { groups, types, priority } = selectedFilterTags

  return Boolean(prisonerId || groups.length > 0 || types.length > 0 || priority.length > 0)
}

export type AllowedStatus = 'APPROVED' | 'DECLINED' | 'PENDING'
export type UiStatus = AllowedStatus | 'CLOSED'

export interface ParsedFilters {
  page: number
  clearFilters: boolean
  status: AllowedStatus[]
  selectedStatusValues: UiStatus[]
  applicationTypeFilter: string
  oldestAppFirst: boolean
  prisonerLabel: string
  prisonerId: string | null
  groups: string[]
  types: string[]
  priority: string[]
}

export function parseApplicationFilters(req: Request): ParsedFilters {
  const clearFilters = req.query.clearFilters === 'true'

  retainFilters(req)

  const statusQuery = req.query.status
  let statusArray: (string | ParsedQs)[]

  if (Array.isArray(statusQuery)) {
    statusArray = statusQuery
  } else if (statusQuery) {
    statusArray = [statusQuery]
  } else {
    statusArray = []
  }

  let status: AllowedStatus[] = statusArray
    .map(s => s.toString().toUpperCase())
    .filter((s): s is AllowedStatus => ['APPROVED', 'DECLINED', 'PENDING'].includes(s))

  if (clearFilters) {
    status = ['PENDING', 'APPROVED', 'DECLINED']
    delete req.session.listFilters
  } else if (status.length === 0) {
    status = ['PENDING']
  }

  const selectedStatusValues: UiStatus[] = clearFilters ? [] : [...status]
  if (!clearFilters && (status.includes('APPROVED') || status.includes('DECLINED'))) {
    selectedStatusValues.push('CLOSED')
  }

  const prisonerLabel = req.query.prisoner?.toString() || ''

  if (!clearFilters) {
    saveFiltersToSession(req)
  }

  return {
    page: Number(req.query.page) || 1,
    clearFilters,
    status,
    selectedStatusValues,
    applicationTypeFilter: req.query.applicationTypeFilter?.toString() || '',
    oldestAppFirst: req.query.order === 'oldest',
    prisonerLabel,
    prisonerId: prisonerLabel.match(/\(([^)]+)\)/)?.[1] || null,
    groups: extractArray(req.query.group),
    types: extractArray(req.query.type).map(t => t.toString()),
    priority: extractArray(req.query.priority),
  }
}

function extractArray(q: unknown): string[] {
  if (!q) return []
  return Array.isArray(q) ? q.map(String) : [String(q)]
}

export function formatFilterOptions(
  applicationTypes: Record<string, { id: number; name: string; count: number }>,
  assignedGroups: ViewAppListAssignedGroup[],
  filters: {
    groups: string[]
    types: string[]
    priority: string[]
    status: string[]
    prisonerId: string | null
    prisonerLabel: string
  },
  firstNightCenter: number,
) {
  const appTypes = formatAppTypesForFilters(applicationTypes, filters)
  const groups = formatGroupsForFilters(assignedGroups, filters)
  const priority = formatPriorityForFilters(filters, firstNightCenter)

  return {
    appTypes,
    groups,
    priority,
    assignedGroups,
  }
}

export function buildSelectedTags(
  req: Request,
  filters: ParsedFilters,
  options: {
    appTypes: { value: string; text: string; checked: boolean }[]
    assignedGroups: ViewAppListAssignedGroup[]
  },
) {
  return {
    status: filters.clearFilters
      ? []
      : filters.status.map(s => {
          let text: string
          if (s === 'APPROVED') {
            text = 'Closed (Approved)'
          } else if (s === 'DECLINED') {
            text = 'Closed (Declined)'
          } else {
            text = s.charAt(0) + s.slice(1).toLowerCase()
          }
          return {
            href: removeFilterFromHref(req, 'status', s),
            text,
          }
        }),

    priority: filters.priority.includes('first-night-centre')
      ? [
          {
            href: removeFilterFromHref(req, 'priority', 'first-night-centre'),
            text: 'First night or early days centre',
          },
        ]
      : [],

    groups: options.assignedGroups
      .filter(g => filters.groups.includes(g.id))
      .map(g => ({
        href: removeFilterFromHref(req, 'group', g.id),
        text: g.name,
      })),

    types: options.appTypes
      .filter(t => t.checked)
      .map(t => ({
        href: removeFilterFromHref(req, 'type', t.value),
        text: t.text.replace(/\s\(\d+\)$/, ''),
      })),
  }
}

export const retainFilters = (req: Request): boolean => {
  if (!req.session.listFilters || Object.keys(req.session.listFilters).length === 0) return false

  const clearFilters = req.query.clearFilters === 'true'
  const hasQueryParams = FILTER_KEYS.some(key => req.query[key] !== undefined)

  if (clearFilters || hasQueryParams || !req.session.listFilters) return false

  FILTER_KEYS.forEach(key => {
    const saved = req.session.listFilters?.[key]
    if (saved !== undefined) {
      req.query[key] = saved
    }
  })

  return true
}

export const retainFiltersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const filtersRestored = retainFilters(req)
  const hasRestoredFilters = Object.keys(req.query).length > 0

  if (filtersRestored && hasRestoredFilters && !req.originalUrl.includes('?')) {
    const queryParams = new URLSearchParams()
    Object.entries(req.query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => v && queryParams.append(key, v.toString()))
      } else if (value) {
        queryParams.append(key, value.toString())
      }
    })
    return res.redirect(`${req.path}?${queryParams.toString()}`)
  }

  return next()
}

export const saveFiltersToSession = (req: Request): void => {
  const saved: ListFilters = {}

  FILTER_KEYS.forEach(key => {
    const value = req.query[key]

    if (Array.isArray(value)) {
      const filtered = value.filter(v => v && v.toString().trim() !== '')
      if (filtered.length > 0) {
        saved[key] = filtered.map(v => v.toString()) as string[] & string
      }
    } else if (value !== undefined && value.toString().trim() !== '') {
      saved[key] = value.toString() as string[] & string
    }
  })

  req.session.listFilters = saved
}
