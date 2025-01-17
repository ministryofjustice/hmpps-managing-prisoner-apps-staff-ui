import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'

export default function applicationsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.APPLICATIONS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      res.render('pages/applications', { title: 'Applications' })
    }),
  )

  return router
}
