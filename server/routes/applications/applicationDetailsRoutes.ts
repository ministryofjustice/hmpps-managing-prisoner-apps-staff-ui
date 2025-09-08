import { Request, Response, Router } from 'express'

import { countries } from '../../constants/countries'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/application/getAppType'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../../constants/personalRelationshipsGroupCodes'
import { getFormattedCountries } from '../../utils/formatCountryList'
import { getFormattedRelationshipDropdown } from '../../utils/formatRelationshipList'
import { getApplicationDetails } from '../../utils/getAppDetails'
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
    URLS.LOG_APPLICATION_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.key)

      if (!applicationType) {
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }

      const logDetails = getAppTypeLogDetailsData(applicationType, applicationData?.additionalData || {})

      if (!logDetails) {
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }

      const templateFields = await getApplicationDetails(logDetails, { personalRelationshipsService })

      await auditService.logPageView(Page.LOG_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.APPLICATION_DETAILS, {
        title: 'Log details',
        ...templateFields,
        applicationType,
        earlyDaysCentre: applicationData?.earlyDaysCentre,
      })
    }),
  )

  router.post(
    URLS.LOG_APPLICATION_DETAILS,
    asyncMiddleware(async (req, res) => {
      const { user } = res.locals
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.key)

      return handleApplicationDetails(req, res, {
        getAppType: () => applicationType,
        getTemplateData: async () => {
          const groupCode =
            applicationType.key === 'PIN_PHONE_ADD_NEW_LEGAL_CONTACT'
              ? PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP
              : PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP

          const formattedRelationshipList = await getFormattedRelationshipDropdown(
            personalRelationshipsService,
            undefined,
            groupCode,
          )

          const formattedCountryList = getFormattedCountries(countries, req.body.country)

          return {
            applicationType,
            formattedRelationshipList,
            countries: formattedCountryList,
          }
        },
        isUpdate: false,
        renderPath: PATHS.LOG_APPLICATION.APPLICATION_DETAILS,
        successRedirect: () => URLS.LOG_CONFIRM_DETAILS,
      })
    }),
  )

  return router
}
