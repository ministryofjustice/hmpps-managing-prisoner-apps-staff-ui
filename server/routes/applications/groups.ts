import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import { Group } from '../../@types/managingAppsApi'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { updateSessionData } from '../../utils/session'

const ERROR_MESSAGE = 'Choose one application group'

export default function groupsRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  const buildGroups = (groups: Group[], selectedValue: string | null) =>
    groups.map(group => ({
      value: group.id.toString(),
      text: group.name,
      checked: selectedValue === group.id.toString(),
    }))

  router.get(
    URLS.LOG_GROUP,
    asyncMiddleware(async (req: Request, res: Response) => {
      const isLoggingForSamePrisoner = req.query.isLoggingForSamePrisoner === 'true' && req.session.prisonerContext

      if (isLoggingForSamePrisoner) {
        const { prisonerId, prisonerName } = req.session.prisonerContext

        updateSessionData(req, { prisonerId, prisonerName })

        req.session.isLoggingForSamePrisoner = true
      }

      const { user } = res.locals
      const { applicationData } = req.session

      if (!applicationData?.prisonerId) {
        return res.redirect(URLS.LOG_PRISONER_DETAILS)
      }

      const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
      const selectedValue = req.session?.applicationData?.group?.value || null

      await auditService.logPageView(Page.LOG_GROUP_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.SELECT_GROUP, {
        title: 'Select application group',
        groups: buildGroups(groups, selectedValue),
        errorMessage: null,
        isLoggingForSamePrisoner,
        prisonerName: isLoggingForSamePrisoner ? req.session.applicationData.prisonerName : null,
      })
    }),
  )

  router.post(
    URLS.LOG_GROUP,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const selectedValue = req.body.group

      const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
      const selectedGroup = groups.find(group => group.id.toString() === selectedValue)

      if (!selectedGroup) {
        return res.render(PATHS.LOG_APPLICATION.SELECT_GROUP, {
          title: 'Select application group',
          groups: buildGroups(groups, null),
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_MESSAGE, href: '#group' }],
        })
      }

      updateSessionData(req, {
        group: { name: selectedGroup.name, value: selectedGroup.id.toString() },
      })

      return res.redirect(URLS.LOG_APPLICATION_TYPE)
    }),
  )

  return router
}
