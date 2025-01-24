import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'

export default function applicationsRoutes({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    '/',
    asyncMiddleware(async (req: Request, res: Response) => {
      await auditService.logPageView(Page.APPLICATIONS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const sections = [
        {
          title: 'Departments',
          items: [
            { name: 'Business Hub', tagText: '44', path: '' },
            { name: 'OMU', tagText: '9', path: '' },
          ],
        },
        {
          title: 'Wings',
          items: [
            { name: 'First Night Centre', tagText: '3', path: '' },
            { name: 'A', tagText: '0', path: '' },
            { name: 'B', tagText: '2', path: '' },
            { name: 'C', tagText: '1', path: '' },
            { name: 'D', tagText: '0', path: '' },
            { name: 'E', tagText: '1', path: '' },
          ],
        },
        {
          title: 'Governors',
          items: [
            { name: 'Paul White', tagText: '1', path: '' },
            { name: 'James Smart', tagText: '0', path: '' },
            { name: 'Syed Hasan', tagText: '4', path: '' },
          ],
        },
      ]

      res.render('pages/applications', { title: 'Applications', sections })
    }),
  )

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

  return router
}
