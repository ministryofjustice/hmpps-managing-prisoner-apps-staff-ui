import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { updateSessionData } from '../../utils/session'

export default function applicationTypeRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals

      await auditService.logPageView(Page.LOG_APPLICATION_TYPE_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      const appTypes = await managingPrisonerAppsService.getAppTypes(user)
      const selectedAppType = req.session?.applicationData?.type || null

      const applicationTypes = appTypes.map(appType => ({
        ...appType,
        text: appType.name,
        checked: selectedAppType?.value === appType.value,
      }))

      res.render('pages/log-application/select-application-type/index', {
        title: 'Select application type',
        applicationTypes,
        errorMessage: null,
      })
    }),
  )

  router.post(
    '/log/application-type',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals

      const appTypes = await managingPrisonerAppsService.getAppTypes(user)
      const selectedAppType = appTypes.find(type => type.value === req.body.applicationType)

      const applicationTypes = appTypes.map(appType => ({
        ...appType,
        text: appType.name,
        checked: selectedAppType?.value === appType.value,
      }))

      if (!selectedAppType) {
        return res.render('pages/log-application/select-application-type/index', {
          title: 'Select application type',
          applicationTypes,
          errorMessage: 'Choose one application type',
          errorSummary: [{ text: 'Choose one application type', href: '#applicationType' }],
        })
      }

      updateSessionData(req, { type: selectedAppType })

      return res.redirect(`/log/prisoner-details`)
    }),
  )

  return router
}
