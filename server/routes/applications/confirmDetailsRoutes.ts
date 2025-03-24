import { Request, Response, Router } from 'express'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { updateSessionData } from '../../utils/session'

export default function confirmDetailsRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    URLS.CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      await auditService.logPageView(Page.CONFIRM_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(applicationData?.type.apiValue)

      if (!applicationType) {
        return res.redirect(URLS.APPLICATION_TYPE)
      }

      return res.render(`pages/log-application/confirm/${applicationType.value}`, {
        applicationData,
        appTypeTitle: 'Swap VOs for PIN credit',
        backLink: URLS.APPLICATION_DETAILS,
        title: 'Check details',
      })
    }),
  )

  router.post(
    URLS.CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { user } = res.locals

      if (!applicationData) {
        return res.redirect(URLS.APPLICATION_DETAILS)
      }

      const application = await managingPrisonerAppsService.submitPrisonerApp(applicationData, user)

      if (!application) {
        return res.redirect(URLS.APPLICATION_DETAILS)
      }

      updateSessionData(req, {
        prisonerName: req.body.prisonerName,
        date: req.body.date,
        prisonerId: req.body.prisonNumber,
      })

      return res.redirect(`/log/submit/${applicationData.prisonerId}/${application.id}`)
    }),
  )

  return router
}
