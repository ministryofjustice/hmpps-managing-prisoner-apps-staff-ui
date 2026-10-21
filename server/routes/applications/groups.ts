import { Request, Response, Router } from 'express'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { Group } from '../../@types/managingAppsApi'
import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { updateSessionData } from '../../utils/http/session'

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

  router.get(URLS.LOG_GROUP, async (req: Request, res: Response) => {
    const { user } = res.locals

    await auditLogged(
      'VIEW_LOG_APPLICATION_GROUP',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_LOG_APPLICATION_GROUP_FAILURE' : what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: req.session.applicationData?.prisonerId || 'NONE',
          subjectType: req.session.applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: {
            ...extraDetails,
            ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
          },
        })
      },
      async () => {
        const isLoggingForSamePrisoner = req.query.isLoggingForSamePrisoner === 'true' && req.session.prisonerContext

        if (isLoggingForSamePrisoner) {
          const { prisonerId, prisonerName } = req.session.prisonerContext

          updateSessionData(req, { prisonerId, prisonerName })

          req.session.isLoggingForSamePrisoner = true
        }

        const { applicationData } = req.session

        if (!applicationData?.prisonerId) {
          return res.redirect(URLS.LOG_PRISONER_DETAILS)
        }

        const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
        const selectedValue = req.session?.applicationData?.group?.value || null

        return res.render(PATHS.LOG_APPLICATION.SELECT_GROUP, {
          title: 'Select application group',
          groups: buildGroups(groups, selectedValue),
          errorMessage: null,
          isLoggingForSamePrisoner,
          prisonerName: isLoggingForSamePrisoner ? req.session.applicationData.prisonerName : null,
        })
      },
    )
  })

  router.post(URLS.LOG_GROUP, async (req: Request, res: Response) => {
    const { user } = res.locals
    const selectedValue = req.body.group
    const prisonerId = req.session.applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_APPLICATION_GROUP',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: { changes: [{ field: 'group' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
      const selectedGroup = groups.find(group => group.id.toString() === selectedValue)

      if (!selectedGroup) {
        await logFailure({ failureReason: 'Validation failed' })
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

      await logSuccess()
      return res.redirect(URLS.LOG_APPLICATION_TYPE)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
