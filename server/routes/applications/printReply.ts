import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { isOpenStatus, APPLICATION_STATUS_LABELS } from '../../constants/applicationStatus'
import { PATHS } from '../../constants/paths'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { convertToTitleCase } from '../../utils/utils'

export default function printReplyRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get('/applications/:prisonerId/:applicationId/print-reply', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals

    const validApplication = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      Page.PRINT_REPLY_PAGE,
    )
    if (!validApplication) return

    const { application, applicationType } = validApplication
    const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())
    const isClosed = !isOpenStatus(application.status)
    const [request] = application.requests ?? []

    let response
    if (isClosed && request?.responseId) {
      const { decision, createdDate, reason } = await managingPrisonerAppsService.getResponse(
        `${prisonerId}`,
        `${applicationId}`,
        request.responseId,
        user,
      )

      response = {
        decision: convertToTitleCase(decision),
        actionedDate: format(createdDate, 'd MMMM yyyy'),
        reason: reason?.trim() || 'None',
        cellLocation: application.requestedBy.cellLocation,
      }
    }

    res.render(PATHS.APPLICATIONS.PRINT_REPLY, {
      application,
      applicationType,
      applicationStatus: APPLICATION_STATUS_LABELS[application.status] ?? application.status,
      response,
      isClosed,
      isForwardable: departments?.length > 1,
      appLoggedDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
      todayDate: format(new Date(), 'd MMMM yyyy'),
      prisonerName: convertToTitleCase(`${application.requestedBy.lastName}, ${application.requestedBy.firstName}`),
      title: applicationType.name,
    })
  })

  return router
}
