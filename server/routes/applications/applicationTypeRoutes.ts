import { Request, Response, Router } from 'express'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'

export default function applicationTypeRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.LOG_APPLICATION_TYPE_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationTypes = APPLICATION_TYPES.map(applicationType => ({
        value: applicationType.value,
        text: applicationType.name,
      }))

      res.render('pages/log/application-type', {
        title: 'Select application type',
        applicationTypes,
      })
    }),
  )

  router.post(
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      const selectedAppType = APPLICATION_TYPES.find(type => type.value === req.body.applicationType)

      if (!selectedAppType) {
        res.status(400).send('Invalid application type selected')
        return
      }

      req.session.applicationData = {
        type: selectedAppType,
        prisonerName: '',
        date: new Date(),
      }

      res.redirect(`/log/prisoner-details`)
    }),
  )

  return router
}
