import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import TestData from '../testutils/testData'

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
      const { departmentName } = req.params
      const { user } = res.locals

      const application = new TestData().prisonerApp

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }

      await auditService.logPageView(Page.VIEW_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.type)

      if (!applicationType) {
        return res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
      }

      return res.render(`pages/view-application/${applicationType.value}`, {
        title: applicationType.name,
        application,
        departmentName,
      })
    }),
  )

  return router
}
