import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { validateForwardingApplication } from '../validate/validateForwardingApplication'

export default function forwardApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications/:departmentName/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }

      await auditService.logPageView(Page.FORWARD_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
      }

      return res.render(`pages/applications/forward/${applicationType.value}`, {
        application,
        departmentName,
        textareaValue: '',
        title: "Forward this application to swap VO's",
        errors: null,
      })
    }),
  )

  router.post(
    '/applications/:departmentName/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { forwardToDepartment, forwardingReason } = req.body
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }

      const applicationType = getApplicationType(application.appType)
      const errors = validateForwardingApplication(forwardToDepartment, forwardingReason)

      if (Object.keys(errors).length > 0) {
        return res.render(`pages/applications/forward/${applicationType.value}`, {
          application,
          departmentName,
          textareaValue: forwardingReason,
          title: "Forward this application to swap VO's",
          errors,
        })
      }

      await managingPrisonerAppsService.forwardApp(prisonerId, applicationId, forwardToDepartment, user)

      return res.redirect(`/applications/${departmentName}/${prisonerId}/${applicationId}`)
    }),
  )

  return router
}
