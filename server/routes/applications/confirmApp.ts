import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/application/getAppType'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { convertToTitleCase } from '../../utils/utils'

export default function confirmAppRouter({
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

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.value)

      if (!applicationType) return res.redirect(URLS.LOG_PRISONER_DETAILS)

      await auditService.logPageView(Page.CONFIRM_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.CONFIRM_DETAILS, {
        applicationType: applicationData?.type.key,
        applicationData: {
          earlyDaysCentre: convertToTitleCase(applicationData?.earlyDaysCentre?.toString()),
          prisoner: `${applicationData?.prisonerName} (${applicationData?.prisonerId})`,
          request: applicationData?.additionalData,
          group: applicationData?.group,
          type: applicationData?.type,
          department: applicationData?.department,
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

      const prisonerContext = applicationData?.prisonerId && {
        prisonerId: applicationData.prisonerId,
        prisonerName: convertToTitleCase(`${applicationData.prisonerName}`),
      }

      delete req.session.applicationData

      if (prisonerContext) {
        req.session.prisonerContext = prisonerContext
      }

      return res.redirect(`${URLS.LOG_SUBMIT_APPLICATION}/${applicationData.prisonerId}/${application.id}`)
    }),
  )

  return router
}
