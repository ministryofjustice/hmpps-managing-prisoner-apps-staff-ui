import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/getAppType'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { convertToTitleCase } from '../../utils/utils'

export default function confirmDetailsRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    URLS.LOG_CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.key)

      if (!applicationType) return res.redirect(URLS.LOG_APPLICATION_TYPE)

      await auditService.logPageView(Page.CONFIRM_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.CONFIRM_DETAILS, {
        applicationData: {
          date: format(new Date(applicationData.date), 'd MMMM yyyy'),
          earlyDaysCentre: convertToTitleCase(applicationData.earlyDaysCentre?.toString()),
          prisoner: `${applicationData.prisonerName} (${applicationData.prisonerId})`,
          request: applicationData.additionalData,
          type: applicationType,
        },
        backLink: URLS.LOG_APPLICATION_DETAILS,
        title: applicationType.name,
      })
    }),
  )

  router.post(
    URLS.LOG_CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { user } = res.locals

      const application = await managingPrisonerAppsService.submitPrisonerApp(applicationData, user)

      delete req.session.applicationData

      return res.redirect(`${URLS.LOG_SUBMIT_APPLICATION}/${applicationData.prisonerId}/${application.id}`)
    }),
  )

  return router
}
