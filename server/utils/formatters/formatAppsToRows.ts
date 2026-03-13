import { format, getTime } from 'date-fns'

import { ViewAppListApp } from '../../@types/managingAppsApi'
import { getAppType } from '../../helpers/application/getAppType'
import { HmppsUser } from '../../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

type ViewAppListAppWithName = ViewAppListApp & {
  prisonerName: string
}
const mojNotificationBadge = (options: { text: string }) => {
  return `<span class="moj-notification-badge">${options.text}</span>`
}

// eslint-disable-next-line import/prefer-default-export
export const formatAppsToRows = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  applications: ViewAppListAppWithName[],
) => {
  return Promise.all(
    applications.map(async application => {
      const { createdDate, appType, requestedBy, assignedGroup, id, prisonerName, comments } = application

      const date = new Date(createdDate)
      const formattedDate = format(date, 'dd/MM/yyyy')
      const sortValue = getTime(date).toString()

      const type = await getAppType(managingPrisonerAppsService, user, appType.id.toString())

      const row = [
        { text: formattedDate, attributes: { 'data-sort-value': sortValue }, classes: 'govuk-!-text-nowrap' },
        { text: type?.name },
        {
          html: `${prisonerName}<br/><span class="govuk-table__subtext govuk-body-s">${requestedBy}</span>`,
        },
        { text: assignedGroup?.name || 'N/A' },
        {
          html: comments > 0 ? mojNotificationBadge({ text: `${comments}` }) : 'None',
        },
        {
          html: `<a href="/applications/${requestedBy}/${id}" class="govuk-link">View</a>`,
        },
      ]

      return row.filter(Boolean)
    }),
  )
}
