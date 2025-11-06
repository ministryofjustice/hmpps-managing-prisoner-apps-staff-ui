import { Request, Response, Router } from 'express'

import { Group } from '../../@types/managingAppsApi'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { appTypeIdToLegacyKeyMap } from '../../testData/appTypes'
import { updateSessionData } from '../../utils/session'

const ERROR_MESSAGE = 'Choose one application type'

export default function appTypeRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  type AppTypeItem = { value: string; text: string; checked: boolean } | { divider: 'or' }
  const buildAppTypes = (group: Group, selectedValue: string | null): AppTypeItem[] => {
    const items: AppTypeItem[] = group.appTypes.map(appType => ({
      value: appType.id.toString(),
      text: appType.name,
      checked: selectedValue === appType.id.toString(),
    }))

    if (items.length > 1) {
      const lastItem = items.pop()
      items.push({ divider: 'or' })
      items.push(lastItem)
    }
    return items
  }

  router.get(
    URLS.LOG_APPLICATION_TYPE,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

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
          legacyKey: appTypeIdToLegacyKeyMap[selectedAppType.id],
        },
      })

      return res.redirect(URLS.LOG_DEPARTMENT)
    }),
  )

  return router
}
