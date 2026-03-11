import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { EXCLUDED_LOG_METHOD_APP_TYPES } from '../../constants/excludedApplicationTypes'

import { getAppType } from '../../helpers/application/getAppType'
import { getPhotosForDisplay, uploadWebcamPhotoDocuments } from '../../helpers/photos'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import DocumentManagementService from '../../services/documentManagementService'

import { convertToTitleCase } from '../../utils/utils'

export default function confirmAppRouter({
  auditService,
  managingPrisonerAppsService,
  documentManagementService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  documentManagementService: DocumentManagementService
}): Router {
  const router = Router()

  router.get(
    URLS.LOG_CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.value)

      if (!applicationType) return res.redirect(URLS.LOG_PRISONER_DETAILS)

      await auditService.logPageView(Page.CONFIRM_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const { photosForDisplay, photoDetails, hasNoPhotos } = getPhotosForDisplay(applicationData)
      const excludedAppTypeIds = Object.values(EXCLUDED_LOG_METHOD_APP_TYPES)
      const isExcluded = excludedAppTypeIds.includes(applicationData?.type.value)

      return res.render(PATHS.LOG_APPLICATION.CONFIRM_DETAILS, {
        applicationType: applicationData?.type.key,
        applicationData: {
          earlyDaysCentre: convertToTitleCase(applicationData?.earlyDaysCentre?.toString()),
          prisoner: `${applicationData?.prisonerName} (${applicationData?.prisonerId})`,
          request: applicationData?.additionalData,
          group: applicationData?.group,
          type: applicationData?.type,
          department: applicationData?.department,
        },
        photos: photosForDisplay,
        photoDetails,
        loggingMethod: applicationData?.loggingMethod,
        hasNoPhotos,
        backLink:
          applicationData?.loggingMethod === 'manual' || !applicationData?.loggingMethod
            ? URLS.LOG_APPLICATION_DETAILS
            : URLS.LOG_ADDITIONAL_PHOTO_DETAILS,
        title: applicationType.name,
        isGeneric: applicationType.genericType || applicationType.genericForm,
        isExcluded,
      })
    }),
  )

  router.post(
    URLS.LOG_CONFIRM_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session
      const { user } = res.locals
      const uploadedDocuments = await uploadWebcamPhotoDocuments(applicationData, user, documentManagementService)

      const applicationPayload = {
        ...applicationData,
        ...(uploadedDocuments.length > 0 && { appFile: uploadedDocuments }),
      }

      const application = await managingPrisonerAppsService.submitPrisonerApp(applicationPayload, user)

      const prisonerContext = applicationData?.prisonerId && {
        prisonerId: applicationData.prisonerId,
        prisonerName: convertToTitleCase(`${applicationData.prisonerName}`),
      }

      delete req.session.applicationData

      if (prisonerContext) {
        req.session.prisonerContext = prisonerContext
      }

      return res.redirect(`${URLS.LOG_SUBMIT_APPLICATION}/${applicationData.prisonerId}/${application.id}`)
    }),
  )

  return router
}
