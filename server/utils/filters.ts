import { Request } from 'express'
import { ParsedQs } from 'qs'
import { ViewAppListAssignedGroup } from '../@types/managingAppsApi'
import { formatAppTypesForFilters } from '../helpers/filters/formatAppTypesForFilters'
import { formatGroupsForFilters } from '../helpers/filters/formatGroupsForFilters'
import { formatPriorityForFilters } from '../helpers/filters/formatPriorityForFilters'

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
  } else if (status.length === 0) {
    status = ['PENDING']
  }

  const selectedStatusValues: UiStatus[] = clearFilters ? [] : [...status]
  if (!clearFilters && (status.includes('APPROVED') || status.includes('DECLINED'))) {
    selectedStatusValues.push('CLOSED')
  }

  const prisonerLabel = req.query.prisoner?.toString() || ''

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
