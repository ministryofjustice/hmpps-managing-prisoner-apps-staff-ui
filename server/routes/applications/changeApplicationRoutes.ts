import { format } from 'date-fns'
import { Request, Response, Router } from 'express'
import { AddEmergencyPinPhoneCreditDetails, SwapVOsForPinCreditDetails } from 'express-session'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'

export default function changeApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications/:prisonerId/:applicationId/change',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      await auditService.logPageView(Page.CHANGE_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications?error=unknown-type`)
      }

      const additionalData = applicationData?.additionalData || {}
      const formData = getAppTypeLogDetailsData(applicationType, additionalData)

      return res.render(`pages/applications/change/index`, {
        application,
        applicationType,
        backLink: `/applications/${prisonerId}/${applicationId}`,
        title: applicationType.name,
        errors: null,
        details: formData?.details || application.requests[0].details || '',
        amount: formData?.amount || String(application.requests[0].amount || ''),
        reason: formData?.reason || application.requests[0].reason || '',
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/change',
    asyncMiddleware(async (req, res) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      return handleApplicationDetails(req, res, {
        getAppType: () => getApplicationType(application.appType),
        getTemplateData: () => ({
          application,
          backLink: `/applications/${prisonerId}/${applicationId}`,
        }),
        renderPath: 'pages/applications/change/index',
        successRedirect: () => `/applications/${prisonerId}/${applicationId}/change/confirm`,
      })
    }),
  )

  router.get(
    '/applications/:prisonerId/:applicationId/change/confirm',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session
      const { user } = res.locals

      if (!applicationData) {
        return res.redirect(`/applications/${prisonerId}/${applicationId}/change?error=session-expired`)
      }

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications?error=unknown-type`)
      }

      await auditService.logPageView(Page.CHANGE_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(`pages/log-application/confirm/index`, {
        application,
        applicationData: {
          date: format(new Date(application.requestedDate), 'd MMMM yyyy'),
          prisoner: `${application.requestedBy.firstName} ${application.requestedBy.lastName}`,
          request: applicationData.additionalData,
          type: applicationType,
        },
        backLink: `/applications/${prisonerId}/${applicationId}/change`,
        isUpdate: true,
        title: applicationType.name,
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/change/confirm',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      await managingPrisonerAppsService.changeApp(
        prisonerId,
        applicationId,
        [
          {
            ...(applicationData.additionalData as Record<string, unknown>),
            id: application.requests[0].id,
          },
        ],
        user,
      )

      return res.redirect(`/applications/${prisonerId}/${applicationId}/change/submit`)
    }),
  )

  router.get(
    '/applications/:prisonerId/:applicationId/change/submit',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationId, prisonerId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        res.redirect('/applications')
        return
      }

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        res.redirect('/applications?error=unknown-type')
        return
      }

      await auditService.logPageView(Page.SUBMIT_APPLICATION_CHANGE_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      res.render(`pages/log-application/submit/index`, {
        title: applicationType.name,
        application,
        isUpdated: true,
      })
    }),
  )

  return router
}
