import { format, getTime } from 'date-fns'

import { ViewAppListApp } from '../../@types/managingAppsApi'
import { getStatusTag } from '../../constants/applicationStatus'
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
  listQuery = '',
) => {
  return Promise.all(
    applications.map(async application => {
      const { createdDate, appType, requestedBy, assignedGroup, id, prisonerName, comments, status } = application

      const date = new Date(createdDate)
      const formattedDate = format(date, 'dd/MM/yyyy')
      const sortValue = getTime(date).toString()

      const type = await getAppType(managingPrisonerAppsService, user, appType.id.toString())
      const statusTag = getStatusTag(status)

      const row = [
        { text: formattedDate, attributes: { 'data-sort-value': sortValue }, classes: 'govuk-!-text-nowrap' },
        {
          html: `${type?.name}<br/><span class="govuk-table__subtext govuk-body-s">${assignedGroup?.name || 'N/A'}</span>`,
        },
        {
          html: `<span class="govuk-!-text-nowrap">${prisonerName}</span><br/><span class="govuk-table__subtext govuk-body-s">${requestedBy}</span>`,
        },
        {
          html: `<strong class="govuk-tag ${statusTag.classes}">${statusTag.text}</strong>`,
        },
        {
          html: comments > 0 ? mojNotificationBadge({ text: `${comments}` }) : 'None',
        },
        {
          html: `<a href="/applications/${requestedBy}/${id}${listQuery ? `?${listQuery}` : ''}" class="govuk-link">View</a>`,
          classes: 'govuk-!-text-nowrap',
        },
      ]

      return row.filter(Boolean)
    }),
  )
}
