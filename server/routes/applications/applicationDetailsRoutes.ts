import { Request, Response, Router } from 'express'
import { countries } from '../../constants/countries'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'
import { getFormattedCountries } from '../../utils/formatCountryList'
import { getFormattedRelationshipDropdown } from '../../utils/formatRelationshipList'
import { getApplicationDetails } from '../../utils/getAppDetails'
import { getAppType } from '../../helpers/getAppType'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import { handleApplicationDetails } from '../../utils/handleAppDetails'

export default function applicationDetailsRoutes({
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
    URLS.APPLICATION_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.key)

      if (!applicationType) {
        return res.redirect(URLS.APPLICATION_TYPE)
      }

      const logDetails = getAppTypeLogDetailsData(applicationType, applicationData?.additionalData || {})

      if (!logDetails) {
        return res.redirect(URLS.APPLICATION_TYPE)
      }

      const templateFields = await getApplicationDetails(logDetails, { personalRelationshipsService })

      await auditService.logPageView(Page.LOG_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      return res.render(`pages/log-application/application-details/index`, {
        title: 'Log details',
        ...templateFields,
        applicationType,
      })
    }),
  )

  router.post(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware(async (req, res) => {
      const { user } = res.locals
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.key)

      return handleApplicationDetails(req, res, {
        getAppType: () => applicationType,
        getTemplateData: async () => {
          const formattedRelationshipList = await getFormattedRelationshipDropdown(personalRelationshipsService)
          const formattedCountryList = getFormattedCountries(countries, req.body.country)

          return {
            applicationType,
            formattedRelationshipList,
            countries: formattedCountryList,
          }
        },
        renderPath: 'pages/log-application/application-details/index',
        successRedirect: () => '/log/confirm',
      })
    }),
  )

  return router
}
