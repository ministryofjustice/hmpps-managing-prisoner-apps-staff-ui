import { Request, Response, Router } from 'express'

import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { isOpenStatus } from '../../constants/applicationStatus'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { formatApplicationHistory } from '../../utils/formatters/formatApplicationHistory'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'

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

    await auditLogged(
      'VIEW_APPLICATION_HISTORY',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_APPLICATION_HISTORY_FAILURE' : what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: {
            entityId: applicationId,
            applicationId,
            ...extraDetails,
            ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
          },
        })
      },
      async () => {
        const validApplication = await getValidApplicationOrRedirect(req, res, managingPrisonerAppsService)
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
      },
    )
  })

  return router
}
