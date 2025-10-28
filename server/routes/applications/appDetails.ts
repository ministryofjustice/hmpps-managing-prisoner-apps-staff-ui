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
import getApplicationDetails from '../../utils/getAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import getFormattedRelationshipDropdown from '../../utils/getFormattedRelationshipDropdown'
import { handleApplicationDetails } from '../../utils/handleAppDetails'

export default function appDetailsRouter({
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
      const { applicationData, isLoggingForSamePrisoner } = req.session

      if (!applicationData?.department) {
        return res.redirect(URLS.LOG_DEPARTMENT)
      }

      const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)

      const selectedGroup = groups.find(group => group.id.toString() === applicationData.group?.value)
      if (!selectedGroup) {
        return res.redirect(URLS.LOG_GROUP)
      }

      const selectedAppType = selectedGroup.applicationTypes.find(
        type => type.id.toString() === applicationData.type?.value,
      )

      if (!selectedAppType) {
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }

      const logDetails = getAppTypeLogDetailsData(selectedAppType.id, applicationData.additionalData || {})

      if (!logDetails) {
        return res.redirect(URLS.LOG_APPLICATION_TYPE)
      }

      const templateFields = await getApplicationDetails(
        logDetails,
        personalRelationshipsService,
        undefined,
        applicationData.earlyDaysCentre,
      )

      await auditService.logPageView(Page.LOG_DETAILS_PAGE, {
        who: user.username,
        correlationId: req.id,
      })

      return res.render(PATHS.LOG_APPLICATION.APPLICATION_DETAILS, {
        ...templateFields,
        applicationType: applicationData.type,
        title: 'Log details',
        isLoggingForSamePrisoner,
        prisonerName: isLoggingForSamePrisoner ? applicationData.prisonerName : null,
      })
    }),
  )

  router.post(
    URLS.LOG_APPLICATION_DETAILS,
    asyncMiddleware(async (req, res) => {
      const { user } = res.locals
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.value)

      return handleApplicationDetails(req, res, {
        getAppType: () => applicationType,
        getTemplateData: async () => {
          const groupCode =
            applicationType.id === 1
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
