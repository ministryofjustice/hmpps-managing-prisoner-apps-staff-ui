import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { updateSessionData } from '../../utils/session'
import { APPLICATION_TYPES } from '../../constants/applicationTypes'

export default function changeApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications/:departmentName/:prisonerId/:applicationId/change',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }

      await auditService.logPageView(Page.CHANGE_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
      }

      return res.render(`pages/applications/change/${applicationType.value}`, {
        application,
        backLink: `/applications/${departmentName}/${prisonerId}/${applicationId}`,
        errors: null,
      })
    }),
  )

  router.post(
    '/applications/:departmentName/:prisonerId/:applicationId/change',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId, departmentName } = req.params
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
        date: new Date(application.requestedDate),
        additionalData: {
          ...applicationData?.additionalData,
          ...(isSwapVOsToPinCredit ? { swapVOsToPinCreditDetails: req.body.swapVosPinCreditDetails } : {}),
        },
      })

      return res.redirect(`/applications/${departmentName}/${prisonerId}/${applicationId}/change/confirm`)
    }),
  )

  router.get(
    '/applications/:departmentName/:prisonerId/:applicationId/change/confirm',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { departmentName, prisonerId, applicationId } = req.params
      const { user } = res.locals
      const { applicationData } = req.session

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications/${departmentName}/pending`)
      }

      await auditService.logPageView(Page.CHANGE_APPLICATION_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications/${departmentName}/pending?error=unknown-type`)
      }

      return res.render(`pages/log-application/confirm/${applicationType.value}`, {
        applicationData,
        backLink: `/applications/${departmentName}/${prisonerId}/${applicationId}/change`,
        errors: null,
        isUpdate: true,
      })
    }),
  )

  return router
}
