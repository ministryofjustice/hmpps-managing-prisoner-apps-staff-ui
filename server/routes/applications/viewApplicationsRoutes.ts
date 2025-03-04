import { Request, Response, Router } from 'express'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

export default function viewApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications/:departmentName/:status(pending|closed)',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, status } = req.params

      res.render('pages/applications/list', {
        status,
        departmentName,
      })
    }),
  )

  router.get(
    '/applications/:departmentName/:prisonerId/:applicationId',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        res.redirect(`/applications/${departmentName}/pending`)
        return
      }

      await auditService.logPageView(Page.VIEW_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = APPLICATION_TYPES.find(type => type.apiValue === application.type)

      if (!applicationType) {
        res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
        return
      }

      res.render(`pages/view-application/${applicationType.value}`, {
        title: applicationType.name,
        application,
        departmentName,
      })
    }),
  )

  router.get(
    '/applications/:departmentName/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        res.redirect(`/applications/${departmentName}/pending`)
        return
      }

      await auditService.logPageView(Page.FORWARD_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = APPLICATION_TYPES.find(type => type.apiValue === application.type)

      if (!applicationType) {
        res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
        return
      }

      res.render(`pages/forward-application/${applicationType.value}`, {
        application,
        departmentName,
      })
    }),
  )

  router.post(
    '/applications/:departmentName/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { forwardToDepartment } = req.body
      const { user } = res.locals

      await managingPrisonerAppsService.forwardApp(prisonerId, applicationId, forwardToDepartment, user)

      res.redirect(`/applications/${departmentName}/${prisonerId}/${applicationId}`)
    }),
  )

  return router
}
