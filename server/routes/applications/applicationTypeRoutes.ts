import { Request, Response, Router } from 'express'

import { ApplicationType } from '../../@types/managingAppsApi'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { updateSessionData } from '../../utils/session'

const ERROR_MESSAGE = 'Choose one application type'

export default function applicationTypeRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  const buildApplicationTypes = (appTypes: ApplicationType[], selectedValue: string | null) =>
    appTypes.map(appType => ({
      ...appType,
      text: appType.name,
      checked: selectedValue === appType.value,
    }))

  router.get(
    URLS.LOG_APPLICATION_TYPE,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      await auditService.logPageView(Page.LOG_APPLICATION_TYPE_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const appTypes = await managingPrisonerAppsService.getAppTypes(user)
      const selectedValue = req.session?.applicationData?.type?.value || null

      res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
        title: 'Select application type',
        applicationTypes: buildApplicationTypes(appTypes, selectedValue),
        errorMessage: null,
      })
    }),
  )

  router.post(
    URLS.LOG_APPLICATION_TYPE,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const selectedValue = req.body.applicationType
      const appTypes = await managingPrisonerAppsService.getAppTypes(user)
      const selectedAppType = appTypes.find(type => type.value === selectedValue)

      if (!selectedAppType) {
        return res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
          title: 'Select application type',
          applicationTypes: buildApplicationTypes(appTypes, null),
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_MESSAGE, href: '#applicationType' }],
        })
      }

      updateSessionData(req, { type: selectedAppType })
      return res.redirect(URLS.LOG_PRISONER_DETAILS)
    }),
  )

  return router
}
