import { format } from 'date-fns'
import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import { getApplicationDetails } from '../../utils/getAppDetails'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

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
    '/applications/:prisonerId/:applicationId/change',
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

      return res.render(`pages/applications/change/index`, {
        application,
        applicationType,
        backLink: `/applications/${prisonerId}/${applicationId}`,
        title: applicationType.name,
        errors: null,
        ...templateData,
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/change',
    asyncMiddleware(async (req, res) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      return handleApplicationDetails(req, res, {
        getAppType: () => getApplicationType(application.appType),
        getTemplateData: async () => ({
          application,
          backLink: `/applications/${prisonerId}/${applicationId}`,
        }),
        renderPath: 'pages/applications/change/index',
        successRedirect: () => `/applications/${prisonerId}/${applicationId}/change/confirm`,
      })
    }),
  )

  router.get(
    '/applications/:prisonerId/:applicationId/change/confirm',
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

      return res.render(`pages/log-application/confirm/index`, {
        application,
        applicationData: {
          date: format(new Date(application.requestedDate), 'd MMMM yyyy'),
          prisoner: `${application.requestedBy.firstName} ${application.requestedBy.lastName}`,
          request: applicationData.additionalData,
          type: applicationType,
        },
        backLink: `/applications/${prisonerId}/${applicationId}/change`,
        isUpdate: true,
        title: applicationType.name,
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/change/confirm',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { applicationData } = req.session
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

      if (!application) {
        return res.redirect(`/applications`)
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

      return res.redirect(`/applications/${prisonerId}/${applicationId}/change/submit`)
    }),
  )

  router.get(
    '/applications/:prisonerId/:applicationId/change/submit',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { application, applicationType } = await getValidApplicationOrRedirect(
        req,
        res,
        auditService,
        managingPrisonerAppsService,
        Page.SUBMIT_APPLICATION_CHANGE_PAGE,
      )

      res.render(`pages/log-application/submit/index`, {
        title: applicationType.name,
        application,
        isUpdated: true,
      })
    }),
  )

  return router
}
