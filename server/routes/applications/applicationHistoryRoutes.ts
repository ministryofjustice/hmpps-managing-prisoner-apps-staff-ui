import { format } from 'date-fns'

import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'

export default function applicationHistoryRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()
  router.get(
    '/applications/:prisonerId/:applicationId/history',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      await auditService.logPageView(Page.APPLICATION_HISTORY_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications?error=unknown-type`)
      }

      const history = (await managingPrisonerAppsService.getHistory(prisonerId, applicationId, user)) || []

      const comments = await managingPrisonerAppsService.getComments(prisonerId, applicationId, user)
      const commentItems = comments?.contents || []

      const responseItems = history.filter(historyItem => historyItem.entityType === 'RESPONSE')
      const responses = await Promise.all(
        responseItems.map(historyItem =>
          managingPrisonerAppsService.getResponse(prisonerId, applicationId, historyItem.entityId, user),
        ),
      )

      const formattedHistory = history.map(historyItem => {
        const dateObj = new Date(historyItem.createdDate)
        const formattedDate = format(dateObj, 'd MMMM yyyy')
        const formattedTime = format(dateObj, 'HH:mm')

        let commentMessage: string | null = null
        let responseMessage: string | null = null

        if (historyItem.entityType === 'COMMENT') {
          const commentFound = commentItems.find(commentItem => commentItem.id === historyItem.entityId)
          commentMessage = commentFound?.message || null
        }

        if (historyItem.entityType === 'RESPONSE') {
          const responseFound = responses.find(responseItem => responseItem?.id === historyItem.entityId)
          responseMessage = responseFound?.reason || null
        }

        return {
          ...historyItem,
          date: formattedDate,
          time: formattedTime,
          commentMessage,
          responseMessage,
        }
      })

      return res.render(`pages/applications/history/index`, {
        application,
        history: formattedHistory,
        title: applicationType.name,
      })
    }),
  )

  return router
}
