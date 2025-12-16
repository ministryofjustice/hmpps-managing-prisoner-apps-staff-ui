import { format, getTime } from 'date-fns'

import { AppDecisionResponse, Comment, History, ViewAppListApp } from '../@types/managingAppsApi'
import { APPLICATION_HISTORY_ENTITY_TYPES } from '../constants/applicationHistoryEntityTypes'
import { getAppType } from '../helpers/application/getAppType'
import { HmppsUser } from '../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'

type ViewAppListAppWithName = ViewAppListApp & {
  prisonerName: string
}

export const formatAppsToRows = async (
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  applications: ViewAppListAppWithName[],
) => {
  return Promise.all(
    applications.map(async application => {
      const { createdDate, appType, requestedBy, assignedGroup, id, prisonerName } = application

      const date = new Date(createdDate)
      const formattedDate = format(date, 'd MMMM yyyy')
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
          html: `<a href="/applications/${requestedBy}/${id}" class="govuk-link">View</a>`,
        },
      ]

      return row.filter(Boolean)
    }),
  )
}

export const formatApplicationHistory = (history: History[], comments: Comment[], responses: AppDecisionResponse[]) => {
  return history.map(historyItem => {
    const dateObj = new Date(historyItem.createdDate)
    const formattedDate = format(dateObj, 'd MMMM yyyy')
    const formattedTime = format(dateObj, 'HH:mm')

    const commentMessage =
      historyItem.entityType === APPLICATION_HISTORY_ENTITY_TYPES.COMMENT
        ? comments.find(item => item?.id === historyItem.entityId)?.message || null
        : null

    const responseMessage =
      historyItem.entityType === APPLICATION_HISTORY_ENTITY_TYPES.RESPONSE
        ? responses.find(item => item?.id === historyItem.entityId)?.reason || null
        : null

    return {
      ...historyItem,
      date: formattedDate,
      time: formattedTime,
      commentMessage,
      responseMessage,
    }
  })
}
