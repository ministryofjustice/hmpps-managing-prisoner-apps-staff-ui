import { Request, Response, Router } from 'express'

import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import AuditService from '../../services/auditService'

import { URLS } from '../../constants/urls'

export default function cancelAppRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_CANCEL_APPLICATION, async (req: Request, res: Response) => {
    const { user } = res.locals
    const prisonerId = req.session.applicationData?.prisonerId

    await auditLogged(
      'DELETE_LOG_APPLICATION_DRAFT',
      async (what, details = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId || 'NONE'),
          subjectType: prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details,
        }),
      async () => {
        delete req.session.applicationData
        delete req.session.prisonerContext
        delete req.session.isLoggingForSamePrisoner

        res.redirect('/')
      },
    )
  })

  return router
}
