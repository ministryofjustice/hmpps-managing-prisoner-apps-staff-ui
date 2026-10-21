import { Request, Response, Router } from 'express'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { buildAppTypes } from '../../helpers/application/buildAppTypes'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
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

    await auditLogged(
      'VIEW_LOG_APPLICATION_TYPE',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_LOG_APPLICATION_TYPE_FAILURE' : what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: applicationData?.prisonerId || 'NONE',
          subjectType: applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: {
            ...extraDetails,
            ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
          },
        })
      },
      async () => {
        if (!applicationData?.group) {
          return res.redirect(URLS.LOG_GROUP)
        }

        const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
        const selectedGroup = groups.find(group => group.id.toString() === applicationData.group.value)

        if (!selectedGroup) {
          return res.redirect(URLS.LOG_GROUP)
        }

        const selectedValue = applicationData?.type?.value || null

        return res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
          title: 'Select application type',
          applicationTypes: buildAppTypes(selectedGroup, selectedValue),
          errorMessage: null,
          isLoggingForSamePrisoner,
          prisonerName: applicationData.prisonerName,
        })
      },
    )
  })

  router.post(URLS.LOG_APPLICATION_TYPE, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session
    const selectedValue = req.body.applicationType
    const prisonerId = applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_APPLICATION_TYPE',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: { changes: [{ field: 'type' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)
      const selectedGroup = groups.find(group => group.id.toString() === applicationData.group.value)

      const allAppTypes = groups.flatMap(group => group.appTypes)
      const selectedAppType = allAppTypes.find(type => type.id.toString() === selectedValue)

      if (!selectedAppType) {
        await logFailure({ failureReason: 'Validation failed' })
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

      await logSuccess()
      return res.redirect(URLS.LOG_DEPARTMENT)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
