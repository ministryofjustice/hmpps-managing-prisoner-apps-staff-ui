import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { formatApplicationHistory } from '../../utils/formatters/formatApplicationHistory'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { isOpenStatus } from '../../constants/applicationStatus'

export default function historyRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()
  router.get('/applications/:prisonerId/:applicationId/history', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals

    const validApplication = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      Page.APPLICATION_HISTORY_PAGE,
    )
    if (!validApplication) return
    const { application, applicationType } = validApplication

    const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())

    const history = (await managingPrisonerAppsService.getHistory(`${prisonerId}`, `${applicationId}`, user)) || []

    const comments = await managingPrisonerAppsService.getComments(`${prisonerId}`, `${applicationId}`, user)
    const commentItems = comments?.contents || []

    const responseItems = history.filter(historyItem => historyItem.entityType === 'RESPONSE')
    const responses = await Promise.all(
      responseItems.map(historyItem =>
        managingPrisonerAppsService.getResponse(`${prisonerId}`, `${applicationId}`, historyItem.entityId, user),
      ),
    )

    const formattedHistory = formatApplicationHistory(history, commentItems, responses)

    res.render(PATHS.APPLICATIONS.HISTORY, {
      application,
      history: formattedHistory,
      title: applicationType.name,
      isClosed: !isOpenStatus(application.status),
      isForwardable: departments?.length > 1,
    })
  })

  return router
}
