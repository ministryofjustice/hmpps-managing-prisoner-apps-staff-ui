import { format } from 'date-fns'
import { APPLICATION_HISTORY_ENTITY_TYPES } from '../constants/applicationHistoryEntityTypes'
import { History, Comment, Response } from '../@types/managingAppsApi'

export default function formatApplicationHistory(history: History[], comments: Comment[], responses: Response[]) {
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
