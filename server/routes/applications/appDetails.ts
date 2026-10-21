import { Request, Response, Router } from 'express'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { countries } from '../../constants/countries'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { EXCLUDED_LOG_METHOD_APP_TYPES } from '../../constants/excludedApplicationTypes'

import { getAppType } from '../../helpers/application/getAppType'

import config from '../../config'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../../constants/personalRelationshipsGroupCodes'
import getApplicationDetails from '../../utils/getAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import getFormattedRelationshipDropdown from '../../utils/formatters/getFormattedRelationshipDropdown'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import { getFormattedCountries } from '../../utils/data/countries'

import { isLogMethodEnabledEstablishment } from '../../constants/enabledEstablishments'

export default function appDetailsRouter({
  auditService,
  managingPrisonerAppsService,
  personalRelationshipsService,
  osPlacesAddressService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  personalRelationshipsService: PersonalRelationshipsService
  osPlacesAddressService?: OsPlacesAddressService
}): Router {
  const router = Router()

  router.get(URLS.LOG_APPLICATION_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData, isLoggingForSamePrisoner } = req.session

    await auditLogged(
      'VIEW_LOG_APPLICATION_DETAILS',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        return auditService.logAuditEvent({
          what: what.endsWith('_SUCCESS') && !successful ? 'VIEW_LOG_APPLICATION_DETAILS_FAILURE' : what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: applicationData?.prisonerId || 'NONE',
          subjectType: applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: {
            ...extraDetails,
            ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
          },
        })
      },
      async () => {
        if (!applicationData?.department) {
          return res.redirect(URLS.LOG_DEPARTMENT)
        }

        const groups = await managingPrisonerAppsService.getGroupsAndTypes(user)

        const selectedGroup = groups.find(group => group.id.toString() === applicationData.group?.value)
        if (!selectedGroup) {
          return res.redirect(URLS.LOG_GROUP)
        }

        const selectedAppType = selectedGroup.appTypes.find(type => type.id.toString() === applicationData.type?.value)

        if (!selectedAppType) {
          return res.redirect(URLS.LOG_APPLICATION_TYPE)
        }

        const isGeneric = selectedAppType.genericType || selectedAppType.genericForm

        const logDetails = getAppTypeLogDetailsData(selectedAppType.id, applicationData.additionalData || {}, isGeneric)

        if (!logDetails) {
          return res.redirect(URLS.LOG_APPLICATION_TYPE)
        }

        const templateFields = await getApplicationDetails(
          logDetails,
          personalRelationshipsService,
          undefined,
          applicationData.earlyDaysCentre,
        )

        let backLink = URLS.LOG_DEPARTMENT

        const excludedAppTypeIds = Object.values(EXCLUDED_LOG_METHOD_APP_TYPES)
        const isExcluded = excludedAppTypeIds.includes(selectedAppType.id.toString())
        const isEnabledEstablishment =
          'activeCaseLoadId' in user && isLogMethodEnabledEstablishment(user.activeCaseLoadId)

        if (
          config.featureFlags.logMethodPageEnabled &&
          isEnabledEstablishment &&
          !isExcluded &&
          applicationData?.loggingMethod
        ) {
          backLink = URLS.LOG_METHOD
        }

        return res.render(PATHS.LOG_APPLICATION.APPLICATION_DETAILS, {
          ...templateFields,
          applicationType: applicationData.type,
          title: 'Log details',
          isLoggingForSamePrisoner,
          isGeneric,
          prisonerName: isLoggingForSamePrisoner ? applicationData.prisonerName : null,
          backLink,
        })
      },
    )
  })

  router.post(URLS.LOG_APPLICATION_DETAILS, async (req, res) => {
    const { user } = res.locals
    const { applicationData } = req.session
    const prisonerId = applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_APPLICATION_DETAILS',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: { changes: [{ field: 'additionalData' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.value)

      await handleApplicationDetails(req, res, {
        getAppType: () => applicationType,
        getTemplateData: async () => {
          const groupCode =
            applicationType.id === 2
              ? PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP
              : PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP

          const formattedRelationshipList = await getFormattedRelationshipDropdown(
            personalRelationshipsService,
            undefined,
            groupCode,
          )

          const formattedCountryList = getFormattedCountries(countries, req.body.country)

          return {
            applicationType: applicationData.type,
            formattedRelationshipList,
            countries: formattedCountryList,
            isGeneric: applicationType.genericType || applicationType.genericForm,
          }
        },
        isUpdate: false,
        renderPath: PATHS.LOG_APPLICATION.APPLICATION_DETAILS,
        successRedirect: () => URLS.LOG_CONFIRM_DETAILS,
        osPlacesAddressService,
      })
      if (res.getHeader('location')) await logSuccess()
      else await logFailure({ failureReason: 'Validation failed' })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
