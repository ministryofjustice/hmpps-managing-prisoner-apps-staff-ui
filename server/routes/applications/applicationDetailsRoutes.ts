import { Request, Response, Router } from 'express'
import { URLS } from '../../constants/urls'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { getApplicationType } from '../../utils/getApplicationType'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import { countries } from '../../constants/countries'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../../constants/personalRelationshipsGroupCodes'
import { relationshipDropdownOptions } from '../../constants/personalRelationshipsList'

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

      const {
        details,
        amount,
        reason,
        firstName,
        lastName,
        dateOfBirthOrAge,
        dob,
        age,
        relationship,
        addressLine1,
        addressLine2,
        townOrCity,
        postcode,
        country,
        telephone1,
        telephone2,
      } = data

      const relationshipList = await personalRelationshipsService.getRelationshipList(
        PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP,
      )
      const formmattedRelationshipList = relationshipDropdownOptions(relationshipList)

      return res.render(`pages/log-application/application-details/index`, {
        title: 'Log details',
        applicationType,
        details,
        amount,
        reason,
        firstName,
        lastName,
        dateOfBirthOrAge,
        dob,
        age,
        relationship,
        addressLine1,
        addressLine2,
        townOrCity,
        postcode,
        country,
        telephone1,
        telephone2,
        countries,
        formmattedRelationshipList,
      })
    }),
  )

  router.post(
    URLS.APPLICATION_DETAILS,
    asyncMiddleware((req, res) => {
      const { applicationData } = req.session

      return handleApplicationDetails(req, res, {
        getAppType: () => getApplicationType(applicationData?.type.apiValue),
        getTemplateData: (_req, _res, appType) => ({ applicationType: appType }),
        renderPath: 'pages/log-application/application-details/index',
        successRedirect: () => '/log/confirm',
      })
    }),
  )

  return router
}
