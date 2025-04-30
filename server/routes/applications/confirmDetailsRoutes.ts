import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'

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

      return res.render(`pages/log-application/confirm/index`, {
        applicationData: {
          date: format(new Date(applicationData.date), 'd MMMM yyyy'),
          prisoner: applicationData.prisonerName,
          request: applicationData.additionalData,
          type: applicationType,
        },
        backLink: URLS.APPLICATION_DETAILS,
        title: applicationType.name,
      })
    }),
  )

  router.post(
    URLS.CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { user } = res.locals

      const application = await managingPrisonerAppsService.submitPrisonerApp(applicationData, user)

      delete req.session.applicationData

      return res.redirect(`/log/submit/${applicationData.prisonerId}/${application.id}`)
    }),
  )

  return router
}
