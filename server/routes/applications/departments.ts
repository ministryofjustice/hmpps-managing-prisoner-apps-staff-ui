import { Request, Response, Router } from 'express'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { EXCLUDED_LOG_METHOD_APP_TYPES } from '../../constants/excludedApplicationTypes'

import config from '../../config'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { updateSessionData } from '../../utils/http/session'

import { isLogMethodEnabledEstablishment } from '../../constants/enabledEstablishments'

const ERROR_MESSAGE = 'Choose a department'

export default function departmentsRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  const buildDepartmentOptions = (departments: { name: string }[], selectedValue: string | null) =>
    departments.map(dept => ({
      value: dept.name,
      text: dept.name,
      checked: selectedValue === dept.name,
    }))

  router.get(URLS.LOG_DEPARTMENT, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData, isLoggingForSamePrisoner } = req.session

    await auditLogged(
      'VIEW_LOG_APPLICATION_DEPARTMENT',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_LOG_APPLICATION_DEPARTMENT_FAILURE' : what,
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
        if (!applicationData?.type) {
          return res.redirect(URLS.LOG_APPLICATION_TYPE)
        }

        const selectedDepartment = applicationData?.department || null
        const departments = await managingPrisonerAppsService.getDepartments(user, applicationData.type.value)
        if (!departments) {
          return res.redirect(URLS.LOG_APPLICATION_TYPE)
        }

        return res.render(PATHS.LOG_APPLICATION.SELECT_DEPARTMENT, {
          title: 'Select department',
          errorMessage: null,
          applicationType: applicationData.type.name,
          departmentOptions: buildDepartmentOptions(departments, selectedDepartment),
          isLoggingForSamePrisoner,
          prisonerName: isLoggingForSamePrisoner ? req.session.applicationData.prisonerName : null,
        })
      },
    )
  })

  router.post(URLS.LOG_DEPARTMENT, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session
    const prisonerId = applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_APPLICATION_DEPARTMENT',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: { changes: [{ field: 'department' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      if (!applicationData?.type) {
        await logFailure({ failureReason: 'Application type not selected' })
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }
      const selectedDepartment = req.body.department
      const departments = await managingPrisonerAppsService.getDepartments(user, applicationData.type.value)
      const selectedDepartmentId = departments.find(dept => dept.name === selectedDepartment)?.id

      if (!selectedDepartment) {
        await logFailure({ failureReason: 'Validation failed' })
        return res.render(PATHS.LOG_APPLICATION.SELECT_DEPARTMENT, {
          title: 'Select department',
          departmentOptions: buildDepartmentOptions(departments, null),
          errorMessage: ERROR_MESSAGE,
          applicationType: applicationData.type.name,
          errorSummary: [{ text: ERROR_MESSAGE, href: '#department' }],
        })
      }

      updateSessionData(req, { department: selectedDepartment, departmentId: selectedDepartmentId })

      const isEnabledEstablishment =
        'activeCaseLoadId' in user && isLogMethodEnabledEstablishment(user.activeCaseLoadId)
      const isAppTypeExcluded = Object.values(EXCLUDED_LOG_METHOD_APP_TYPES).includes(applicationData.type.value)

      if (!isEnabledEstablishment || !config.featureFlags.logMethodPageEnabled || isAppTypeExcluded) {
        await logSuccess()
        return res.redirect(URLS.LOG_APPLICATION_DETAILS)
      }

      if (applicationData?.loggingMethod) {
        await logSuccess()
        return res.redirect(URLS.LOG_CONFIRM_DETAILS)
      }

      await logSuccess()
      return res.redirect(URLS.LOG_METHOD)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
