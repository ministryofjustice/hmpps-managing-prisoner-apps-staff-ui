import { format, getTime } from 'date-fns'

import { ViewApplicationsResponseApplication } from '../@types/managingAppsApi'
import { APPLICATION_TYPES } from '../constants/applicationTypes'

type ViewAppsResponseAppWithName = ViewApplicationsResponseApplication & {
  prisonerName: string
}

// eslint-disable-next-line import/prefer-default-export
export function formatApplicationsToRows(applications: ViewAppsResponseAppWithName[]) {
  return applications.map(({ requestedDate, appType, requestedBy, assignedGroup, status, id, prisonerName }) => {
    const date = new Date(requestedDate)
    const formattedDate = format(date, 'd MMMM yyyy')
    const sortValue = getTime(date)
    const type = APPLICATION_TYPES.find(t => t.apiValue === appType)?.name || 'N/A'
    const statusText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

    return [
      { text: formattedDate, attributes: { 'data-sort-value': sortValue.toString() } },
      { text: type },
      { html: `${prisonerName}<br/><span class="govuk-table__subtext govuk-body-s">${requestedBy}</span>` },
      { text: assignedGroup?.name || 'N/A' },
      status !== 'PENDING' ? { text: statusText } : null,
      { html: `<a href="/applications/${requestedBy}/${id}" class="govuk-link">View</a>` },
    ].filter(Boolean)
  })
}
