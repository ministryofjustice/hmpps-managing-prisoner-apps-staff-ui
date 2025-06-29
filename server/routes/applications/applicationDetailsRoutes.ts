import { Request, Response, Router } from 'express'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import { countries } from '../../constants/countries'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'
import { getFormattedRelationshipDropdown } from '../../utils/formatRelationshipList'
import { getFormattedCountries } from '../../utils/formatCountryList'
import { getApplicationDetails } from '../../utils/getAppDetails'

export default function applicationDetailsRoutes({
  auditService,
  personalRelationshipsService,
}: {
  auditService: AuditService
  personalRelationshipsService: PersonalRelationshipsService
}): Router {
  const router = Router()

  router.get(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      await auditService.logPageView(Page.LOG_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(applicationData?.type.apiValue)

      const additionalData = applicationData?.additionalData || {}

      const data = applicationType ? getAppTypeLogDetailsData(applicationType, additionalData) : null

      if (!applicationType || !data) {
        return res.redirect(URLS.APPLICATION_TYPE)
      }

      const templateFields = await getApplicationDetails(data, { personalRelationshipsService })

      return res.render(`pages/log-application/application-details/index`, {
        title: 'Log details',
        ...templateFields,
        applicationType,
      })
    }),
  )

  router.post(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware((req, res) => {
      const { applicationData } = req.session

      return handleApplicationDetails(req, res, {
        getAppType: () => getApplicationType(applicationData?.type.apiValue),
        getTemplateData: async (_req, _res, appType) => {
          const formattedRelationshipList = await getFormattedRelationshipDropdown(personalRelationshipsService)
          const formattedCountryList = getFormattedCountries(countries, req.body.country)

          return {
            applicationType: appType,
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
