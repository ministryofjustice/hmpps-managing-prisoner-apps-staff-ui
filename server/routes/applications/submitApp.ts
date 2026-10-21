import { Request, Response, Router } from 'express'

import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { convertToTitleCase } from '../../utils/utils'

export default function submitAppRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(`${URLS.LOG_SUBMIT_APPLICATION}/:prisonerId/:applicationId`, async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals

    await auditLogged(
      'VIEW_SUBMIT_APPLICATION',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_SUBMIT_APPLICATION_FAILURE' : what,
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

        res.render(PATHS.LOG_APPLICATION.SUBMIT, {
          title: applicationType.name,
          application,
          prisonerName: convertToTitleCase(`${application.requestedBy.firstName} ${application.requestedBy.lastName}`),
        })
      },
    )
  })

  return router
}
