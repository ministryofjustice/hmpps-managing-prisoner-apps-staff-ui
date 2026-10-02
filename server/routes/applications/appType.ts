import { Request, Response, Router } from 'express'
import { buildAppTypes } from '../../helpers/application/buildAppTypes'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { updateSessionData } from '../../utils/http/session'

const ERROR_MESSAGE = 'Choose one application type'

export default function appTypeRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(URLS.LOG_APPLICATION_TYPE, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData, isLoggingForSamePrisoner } = req.session

    if (!applicationData?.group) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
    const selectedGroup = groups.find(group => group.id.toString() === applicationData.group.value)

    if (!selectedGroup) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const selectedValue = applicationData?.type?.value || null

    await auditService.logPageView(Page.LOG_APPLICATION_TYPE_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
      title: 'Select application type',
      applicationTypes: buildAppTypes(selectedGroup, selectedValue),
      errorMessage: null,
      isLoggingForSamePrisoner,
      prisonerName: applicationData.prisonerName,
    })
  })

  router.post(URLS.LOG_APPLICATION_TYPE, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session
    const selectedValue = req.body.applicationType

    const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
    const selectedGroup = groups.find(group => group.id.toString() === applicationData.group.value)

    const allAppTypes = groups.flatMap(group => group.appTypes)
    const selectedAppType = allAppTypes.find(type => type.id.toString() === selectedValue)

    if (!selectedAppType) {
      return res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
        title: 'Select application type',
        applicationTypes: buildAppTypes(selectedGroup, null),
        errorMessage: ERROR_MESSAGE,
        errorSummary: [{ text: ERROR_MESSAGE, href: '#applicationType' }],
      })
    }

    const appTypeChanged = applicationData?.type?.value !== selectedValue
    if (appTypeChanged) {
      delete req.session.applicationData.loggingMethod
      delete req.session.applicationData.additionalData
      delete req.session.applicationData.addAnotherPhoto
      delete req.session.applicationData.photoAdditionalDetails
    }

    updateSessionData(req, {
      type: {
        key: selectedAppType.name
          .replace(/[^\w\s]/g, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        name: selectedAppType.name,
        value: selectedAppType.id.toString(),
        genericType: selectedAppType.genericType || false,
        genericForm: selectedAppType.genericForm || false,
      },
    })

    return res.redirect(URLS.LOG_DEPARTMENT)
  })

  return router
}
