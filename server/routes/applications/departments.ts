import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { updateSessionData } from '../../utils/http/session'

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

  router.get(
    URLS.LOG_DEPARTMENT,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData, isLoggingForSamePrisoner } = req.session

      if (!applicationData?.type) {
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }

      const selectedDepartment = applicationData?.department || null
      const departments = await managingPrisonerAppsService.getDepartments(user, applicationData.type.value)
      if (!departments) {
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }

      await auditService.logPageView(Page.LOG_DEPARTMENT_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.SELECT_DEPARTMENT, {
        title: 'Select department',
        errorMessage: null,
        applicationType: applicationData.type.name,
        departmentOptions: buildDepartmentOptions(departments, selectedDepartment),
        isLoggingForSamePrisoner,
        prisonerName: isLoggingForSamePrisoner ? req.session.applicationData.prisonerName : null,
      })
    }),
  )

  router.post(
    URLS.LOG_DEPARTMENT,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      if (!applicationData?.type) {
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }

      const selectedDepartment = req.body.department
      const departments = await managingPrisonerAppsService.getDepartments(user, applicationData.type.value)
      const selectedDepartmentId = departments.find(dept => dept.name === selectedDepartment)?.id

      if (!selectedDepartment) {
        return res.render(PATHS.LOG_APPLICATION.SELECT_DEPARTMENT, {
          title: 'Select department',
          departmentOptions: buildDepartmentOptions(departments, null),
          errorMessage: ERROR_MESSAGE,
          applicationType: applicationData.type.name,
          errorSummary: [{ text: ERROR_MESSAGE, href: '#department' }],
        })
      }

      updateSessionData(req, { department: selectedDepartment, departmentId: selectedDepartmentId })
      return res.redirect(URLS.LOG_APPLICATION_DETAILS)
    }),
  )

  return router
}
