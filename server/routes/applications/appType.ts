import { Request, Response, Router } from 'express'

import { Group } from '../../@types/managingAppsApi'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { appTypeIdToLegacyKeyMap } from '../../testData/appTypes'
import { updateSessionData } from '../../utils/session'

type AppTypeItem = { value: string; text: string; checked: boolean } | { divider: 'or' }

const ERROR_MESSAGE = 'Choose one application type'

export default function appTypeRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  const buildAppTypes = (group: Group, selectedValue: string | null): AppTypeItem[] => {
    const items: AppTypeItem[] = []

    const genericAppType = group.appTypes.find(appType => appType.genericType)
    const nonGenericAppTypes = group.appTypes.filter(appType => !appType.genericType)
    nonGenericAppTypes.forEach(appType => {
      items.push({
        value: appType.id.toString(),
        text: appType.name,
        checked: selectedValue === appType.id.toString(),
      })
    })
    if (genericAppType) {
      items.push({ divider: 'or' })
      items.push({
        value: genericAppType.id.toString(),
        text: genericAppType.name,
        checked: selectedValue === genericAppType.id.toString(),
      })
    }

    return items
  }

  router.get(
    URLS.LOG_APPLICATION_TYPE,
    asyncMiddleware(async (req: Request, res: Response) => {
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
    }),
  )

  router.post(
    URLS.LOG_APPLICATION_TYPE,
    asyncMiddleware(async (req: Request, res: Response) => {
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
          legacyKey: appTypeIdToLegacyKeyMap[selectedAppType.id],
        },
      })

      return res.redirect(URLS.LOG_DEPARTMENT)
    }),
  )

  return router
}
