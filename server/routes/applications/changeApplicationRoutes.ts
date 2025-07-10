import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/application/getAppType'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

import { getApplicationDetails } from '../../utils/getAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { handleApplicationDetails } from '../../utils/handleAppDetails'

export default function changeApplicationRoutes({
  auditService,
  managingPrisonerAppsService,
  personalRelationshipsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  personalRelationshipsService: PersonalRelationshipsService
}): Router {
  const router = Router()

  router.get(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/change`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session

      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.CHANGE_APPLICATION_PAGE,
      )

      const additionalData = applicationData?.additionalData || {}
      const formData = getAppTypeLogDetailsData(applicationType, additionalData)
      const templateData = await getApplicationDetails(formData, { personalRelationshipsService }, application)

      return res.render(PATHS.APPLICATIONS.CHANGE_DETAILS, {
        application,
        applicationType,
        backLink: `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}`,
        title: applicationType.name,
        errors: null,
        ...templateData,
      })
    }),
  )

  router.post(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/change`,
    asyncMiddleware(async (req, res) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
      const applicationType = await getAppType(managingPrisonerAppsService, user, application.appType)

      return handleApplicationDetails(req, res, {
        getAppType: () => applicationType,
        getTemplateData: async () => ({
          application,
          backLink: `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}`,
        }),
        renderPath: PATHS.APPLICATIONS.CHANGE_DETAILS,
        successRedirect: () => `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/change/confirm`,
      })
    }),
  )

  router.get(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/change/confirm`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session

      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.CHANGE_APPLICATION_PAGE,
      )

      return res.render(PATHS.LOG_APPLICATION.CONFIRM_DETAILS, {
        application,
        applicationData: {
          date: format(new Date(application.requestedDate), 'd MMMM yyyy'),
          prisoner: `${application.requestedBy.firstName} ${application.requestedBy.lastName}`,
          request: applicationData.additionalData,
          type: applicationType,
        },
        backLink: `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/change`,
        isUpdate: true,
        title: applicationType.name,
      })
    }),
  )

  router.post(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/change/confirm`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(URLS.APPLICATIONS)
      }

      await managingPrisonerAppsService.changeApp(
        prisonerId,
        applicationId,
        [
          {
            ...(applicationData.additionalData as Record<string, unknown>),
            id: application.requests[0].id,
          },
        ],
        user,
      )

      return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/change/submit`)
    }),
  )

  router.get(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/change/submit`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.SUBMIT_APPLICATION_CHANGE_PAGE,
      )

      res.render(PATHS.LOG_APPLICATION.SUBMIT, {
        title: applicationType.name,
        application,
        isUpdated: true,
      })
    }),
  )

  return router
}
