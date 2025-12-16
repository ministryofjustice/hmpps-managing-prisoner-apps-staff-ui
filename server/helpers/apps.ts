import { ViewAppListApp } from '../@types/managingAppsApi'
import { ParsedFilters } from '../utils/http/filters'

export const buildApplicationsPayload = (filters: ParsedFilters) => {
  return {
    page: filters.page,
    size: 10,
    status: filters.status,
    applicationTypes: filters.types.length > 0 ? filters.types.map(Number) : undefined,
    requestedBy: filters.prisonerId || undefined,
    assignedGroups: filters.groups.length > 0 ? filters.groups : undefined,
    firstNightCenter: filters.priority.includes('first-night-centre') ? true : undefined,
    oldestAppFirst: filters.oldestAppFirst,
  }
}

export const addPrisonerNames = (apps: ViewAppListApp[]) => {
  return apps.map(app => ({
    ...app,
    prisonerName: `${app.requestedByLastName}, ${app.requestedByFirstName}`,
  }))
}
