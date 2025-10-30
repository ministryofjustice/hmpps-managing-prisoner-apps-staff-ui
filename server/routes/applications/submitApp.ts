import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { convertToTitleCase } from '../../utils/utils'

export default function submitAppRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    `${URLS.LOG_SUBMIT_APPLICATION}/:prisonerId/:applicationId`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.SUBMIT_APPLICATION_PAGE,
      )

      res.render(PATHS.LOG_APPLICATION.SUBMIT, {
        title: applicationType.name,
        application,
        prisonerName: convertToTitleCase(`${application.requestedBy.firstName} ${application.requestedBy.lastName}`),
      })
    }),
  )

  return router
}
