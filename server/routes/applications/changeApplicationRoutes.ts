import { format } from 'date-fns'
import { Request, Response, Router } from 'express'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { updateSessionData } from '../../utils/session'

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

      return res.render(`pages/applications/change/index`, {
        application,
        applicationType,
        backLink: `/applications/${prisonerId}/${applicationId}`,
        title: applicationType.name,
        errors: null,
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/change',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
      const selectedAppType = getApplicationType(application.appType)

      const isSwapVOsToPinCredit =
        selectedAppType.apiValue ===
        APPLICATION_TYPES.find(type => type.value === 'swap-visiting-orders-for-pin-credit')?.apiValue

      updateSessionData(req, {
        type: selectedAppType,
        prisonerName: prisonerId,
        date: application.requestedDate,
        additionalData: {
          ...applicationData?.additionalData,
          ...(isSwapVOsToPinCredit ? { details: req.body.swapVosPinCreditDetails } : {}),
        },
      })

      return res.redirect(`/applications/${prisonerId}/${applicationId}/change/confirm`)
    }),
  )

  router.get(
    '/applications/:prisonerId/:applicationId/change/confirm',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals
      const { applicationData } = req.session

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

      return res.render(`pages/log-application/confirm/index`, {
        applicationData: {
          ...applicationData,
          date: format(new Date(applicationData.date), 'd MMMM yyyy'),
        },
        applicationType,
        backLink: `/applications/${prisonerId}/${applicationId}/change`,
        isUpdate: true,
        title: applicationType.name,
        errors: null,
      })
    }),
  )

  return router
}
