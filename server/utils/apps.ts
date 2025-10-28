import { format, getTime } from 'date-fns'

import { ViewAppListApp } from '../@types/managingAppsApi'
import { APPLICATION_STATUS } from '../constants/applicationStatus'
import { getAppType } from '../helpers/application/getAppType'
import { HmppsUser } from '../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'

type ViewAppListAppWithName = ViewAppListApp & {
  prisonerName: string
}

// eslint-disable-next-line import/prefer-default-export
export const formatAppsToRows = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  applications: ViewAppListAppWithName[],
) => {
  return Promise.all(
    applications.map(async application => {
      const { createdDate, appType, requestedBy, assignedGroup, status, id, prisonerName } = application

      const date = new Date(createdDate)
      const formattedDate = format(date, 'd MMMM yyyy')
      const sortValue = getTime(date).toString()

      const type = await getAppType(managingPrisonerAppsService, user, appType)
      const statusText =
        status === APPLICATION_STATUS.PENDING ? null : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

      const row = [
        { text: formattedDate, attributes: { 'data-sort-value': sortValue }, classes: 'govuk-!-text-nowrap' },
        { text: type?.name },
        {
          html: `${prisonerName}<br/><span class="govuk-table__subtext govuk-body-s">${requestedBy}</span>`,
        },
        { text: assignedGroup?.name || 'N/A' },
        statusText && { text: statusText },
        {
          html: `<a href="/applications/${requestedBy}/${id}" class="govuk-link">View</a>`,
        },
      ]

      return row.filter(Boolean)
    }),
  )
}
