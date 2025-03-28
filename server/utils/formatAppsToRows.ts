import { format, getTime } from 'date-fns'

import { ViewApplicationsResponseApplication } from '../@types/managingAppsApi'
import { APPLICATION_TYPES } from '../constants/applicationTypes'

// eslint-disable-next-line import/prefer-default-export
export function formatApplicationsToRows(applications: ViewApplicationsResponseApplication[]) {
  return applications.map(({ requestedDate, appType, requestedBy, assignedGroup, status, id }) => {
    const date = new Date(requestedDate)
    const formattedDate = format(date, 'd MMMM yyyy')
    const sortValue = getTime(date)
    const type = APPLICATION_TYPES.find(t => t.apiValue === appType)?.name || 'N/A'

    return [
      { text: formattedDate, attributes: { 'data-sort-value': sortValue.toString() } },
      { text: type },
      { html: `Patel, Taj<br/><span class="govuk-table__subtext govuk-body-s">${requestedBy}</span>` },
      { text: assignedGroup?.name || 'N/A' },
      status === 'CLOSED' ? { text: 'Decision' } : null,
      { html: `<a href="/applications/${requestedBy}/${id}" class="govuk-link">View</a>` },
    ].filter(Boolean)
  })
}
