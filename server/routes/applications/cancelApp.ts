import { Request, Response, Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

import { URLS } from '../../constants/urls'

export default function cancelAppRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_CANCEL_APPLICATION, async (req: Request, res: Response) => {
    const { user } = res.locals
    delete req.session.applicationData
    delete req.session.prisonerContext
    delete req.session.isLoggingForSamePrisoner

    await auditService.logPageView(Page.LOG_CANCEL_APPLICATION_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    return res.redirect('/')
  })

  return router
}
