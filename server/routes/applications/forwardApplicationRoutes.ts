import { Request, Response, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import { getAppType } from '../../helpers/getAppType'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { validateForwardingApplication } from '../validate/validateForwardingApplication'

export default function forwardApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals

      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.FORWARD_APPLICATION_PAGE,
      )

      const groups = await managingPrisonerAppsService.getGroups(user)

      const departments = groups
        .filter(group => group.id !== application.assignedGroup.id)
        .map(group => ({
          value: group.id,
          text: group.name,
        }))

      return res.render('pages/applications/forward/index', {
        application,
        applicationType,
        departments,
        textareaValue: '',
        title: 'Forward this application',
        errors: null,
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/forward',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { forwardTo, forwardingReason } = req.body
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
      const groups = await managingPrisonerAppsService.getGroups(user)

      if (!application) {
        return res.redirect(`/applications`)
      }

      const applicationType = await getAppType(managingPrisonerAppsService, user, application.appType)
      const errors = validateForwardingApplication(forwardTo, forwardingReason)

      const departments = groups
        .filter(group => group.id !== application.assignedGroup.id)
        .map(group => ({
          value: group.id,
          text: group.name,
        }))

      if (Object.keys(errors).length > 0) {
        return res.render('pages/applications/forward/index', {
          application,
          applicationType,
          departments,
          forwardTo,
          textareaValue: forwardingReason,
          title: 'Forward this application',
          errors,
        })
      }

      await managingPrisonerAppsService.forwardApp(applicationId, forwardTo, user, forwardingReason)

      return res.redirect(`/applications/${prisonerId}/${applicationId}`)
    }),
  )

  return router
}
