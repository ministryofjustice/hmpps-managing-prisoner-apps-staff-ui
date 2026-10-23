import { Router } from 'express'
import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import AuditService from '../../services/auditService'

export default function staticPagesRoutes(auditService: AuditService): Router {
  const router = Router()

  router.get('/accessibility-statement', async (req, res) => {
    const { user } = res.locals

    await auditLogged(
      'VIEW_ACCESSIBILITY_STATEMENT',
      async (what, details = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details,
        }),
      async () => {
        res.render('pages/static-pages/accessibility-statement')
      },
    )
  })

  return router
}
