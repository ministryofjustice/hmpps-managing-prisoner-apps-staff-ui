import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { updateSessionData } from '../../utils/session'
import { ApplicationType } from '../../@types/managingAppsApi'
import { URLS } from '../../constants/urls'

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
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      await auditService.logPageView(Page.LOG_APPLICATION_TYPE_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const appTypes = await managingPrisonerAppsService.getAppTypes(user)
      const selectedValue = req.session?.applicationData?.type?.value || null

      res.render(URLS.VIEW_SELECT_APPLICATION_TYPE, {
        title: 'Select application type',
        applicationTypes: buildApplicationTypes(appTypes, selectedValue),
        errorMessage: null,
      })
    }),
  )

  router.post(
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const selectedValue = req.body.applicationType
      const appTypes = await managingPrisonerAppsService.getAppTypes(user)
      const selectedAppType = appTypes.find(type => type.value === selectedValue)

      if (!selectedAppType) {
        return res.render(URLS.VIEW_SELECT_APPLICATION_TYPE, {
          title: 'Select application type',
          applicationTypes: buildApplicationTypes(appTypes, null),
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_MESSAGE, href: '#applicationType' }],
        })
      }

      updateSessionData(req, { type: selectedAppType })
      return res.redirect('/log/prisoner-details')
    }),
  )

  return router
}
