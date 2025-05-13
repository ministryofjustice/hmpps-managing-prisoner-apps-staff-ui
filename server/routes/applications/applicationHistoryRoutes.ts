import { format } from 'date-fns'

import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import formatApplicationHistory from '../../utils/formatApplicationHistory'

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

      const formattedHistory = formatApplicationHistory(history, commentItems, responses)

      return res.render(`pages/applications/history/index`, {
        application,
        history: formattedHistory,
        title: applicationType.name,
      })
    }),
  )

  return router
}
