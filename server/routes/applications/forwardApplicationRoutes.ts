import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/application/getAppType'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { validateForwardingApplication } from '../validate/validateForwardingApplication'

const PAGE_TITLE = 'Forward this application'

export default function forwardApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/forward`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals

      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.FORWARD_APPLICATION_PAGE,
      )

      const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.key)
      const filteredDepartments = (departments ?? [])
        .filter(dept => dept.id !== application.assignedGroup.id)
        .map(dept => ({
          value: dept.id,
          text: dept.name,
        }))

      return res.render(PATHS.APPLICATIONS.FORWARD, {
        application,
        applicationType,
        departments: filteredDepartments,
        textareaValue: '',
        title: PAGE_TITLE,
        errors: null,
      })
    }),
  )

  router.post(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/forward`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { forwardTo, forwardingReason } = req.body
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
      if (!application) return res.redirect(URLS.APPLICATIONS)

      const applicationType = await getAppType(managingPrisonerAppsService, user, application.appType)
      const errors = validateForwardingApplication(forwardTo, forwardingReason)

      const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.key)

      const filteredDepartments = (departments ?? [])
        .filter(dept => dept.id !== application.assignedGroup.id)
        .map(dept => ({
          value: dept.id,
          text: dept.name,
        }))

      if (Object.keys(errors).length > 0) {
        return res.render(PATHS.APPLICATIONS.FORWARD, {
          application,
          applicationType,
          departments: filteredDepartments,
          forwardTo,
          textareaValue: forwardingReason,
          title: PAGE_TITLE,
          errors,
        })
      }

      await managingPrisonerAppsService.forwardApp(applicationId, forwardTo, user, forwardingReason)

      return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}`)
    }),
  )

  return router
}
