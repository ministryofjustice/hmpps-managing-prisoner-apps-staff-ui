import { Request, Response, Router } from 'express'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/session'

export default function applicationTypeRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.LOG_APPLICATION_TYPE_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const selectedAppType = req.session?.applicationData?.type || null

      const applicationTypes = APPLICATION_TYPES.map(applicationType => ({
        apiValue: applicationType.apiValue,
        value: applicationType.value,
        text: applicationType.name,
        checked: applicationType.value === selectedAppType?.value,
      }))

      res.render('pages/log-application/select-application-type/index', {
        title: 'Select application type',
        applicationTypes,
        errorMessage: null,
      })
    }),
  )

  router.post(
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      const selectedAppType = APPLICATION_TYPES.find(type => type.value === req.body.applicationType)

      const applicationTypes = APPLICATION_TYPES.map(applicationType => ({
        apiValue: applicationType.apiValue,
        value: applicationType.value,
        text: applicationType.name,
      }))

      if (!selectedAppType) {
        return res.render('pages/log-application/select-application-type/index', {
          title: 'Select application type',
          applicationTypes,
          errorMessage: 'Choose one application type',
          errorSummary: [{ text: 'Choose one application type', href: '#applicationType' }],
        })
      }

      updateSessionData(req, { type: selectedAppType })

      return res.redirect(`/log/prisoner-details`)
    }),
  )

  return router
}
