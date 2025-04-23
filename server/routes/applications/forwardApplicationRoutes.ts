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
    '/applications/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
      const groups = await managingPrisonerAppsService.getGroups(user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      await auditService.logPageView(Page.FORWARD_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications?error=unknown-type`)
      }

      const departments = groups.map(group => ({
        value: group.id,
        text: group.name,
      }))

      return res.render('pages/applications/forward/index', {
        application,
        applicationType,
        departments,
        textareaValue: '',
        title: 'Forward this application',
        errors: null,
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { forwardTo, forwardingReason } = req.body
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      const applicationType = getApplicationType(application.appType)
      const errors = validateForwardingApplication(forwardTo, forwardingReason)

      if (Object.keys(errors).length > 0) {
        return res.render('pages/applications/forward/index', {
          application,
          applicationType,
          textareaValue: forwardingReason,
          title: 'Forward this application',
          errors,
        })
      }

      await managingPrisonerAppsService.forwardApp(applicationId, forwardTo, user)

      return res.redirect(`/applications/${prisonerId}/${applicationId}`)
    }),
  )

  return router
}
