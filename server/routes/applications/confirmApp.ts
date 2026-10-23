import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { EXCLUDED_LOG_METHOD_APP_TYPES } from '../../constants/excludedApplicationTypes'

import { getAppType } from '../../helpers/application/getAppType'
import { getPhotosForDisplay, uploadWebcamPhotoDocuments } from '../../helpers/photos'

import AuditService from '../../services/auditService'
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

  router.get(URLS.LOG_CONFIRM_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_LOG_APPLICATION_CONFIRM_DETAILS',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: applicationData?.prisonerId || 'NONE',
          subjectType: applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: extraDetails,
        }),
    )

    await logAttempt()
    try {
      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.value)

      if (!applicationType) {
        await logFailure({ failureReason: 'Application type not found' })
        return res.redirect(URLS.LOG_PRISONER_DETAILS)
      }

      const { photosForDisplay, photoDetails, hasNoPhotos } = getPhotosForDisplay(applicationData)
      const excludedAppTypeIds = Object.values(EXCLUDED_LOG_METHOD_APP_TYPES)
      const isExcluded = excludedAppTypeIds.includes(applicationData?.type.value)

      await logSuccess()
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
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(URLS.LOG_CONFIRM_DETAILS, async (req: Request, res: Response) => {
    const { applicationData } = req.session
    const { user } = res.locals
    const prisonerId = applicationData?.prisonerId || 'NONE'
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'CREATE_APPLICATION',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: prisonerId === 'NONE' ? 'NOT_APPLICABLE' : 'PRISONER_ID',
          details: {
            changes: [{ field: 'application' }],
            ...(what.endsWith('_SUCCESS') ? res.locals.auditDetails : {}),
            ...extraDetails,
          },
        }),
    )

    await logAttempt()
    try {
      const uploadedDocuments = await uploadWebcamPhotoDocuments(applicationData, user, documentManagementService)

      const applicationPayload = {
        ...applicationData,
        ...(uploadedDocuments.length > 0 && { appFile: uploadedDocuments }),
      }

      const application = await managingPrisonerAppsService.submitPrisonerApp(applicationPayload, user)

      res.locals.auditDetails = { entityId: String(application.id), applicationId: String(application.id) }

      const prisonerContext = applicationData?.prisonerId && {
        prisonerId: applicationData.prisonerId,
        prisonerName: convertToTitleCase(`${applicationData.prisonerName}`),
      }

      delete req.session.applicationData

      if (prisonerContext) {
        req.session.prisonerContext = prisonerContext
      }

      await logSuccess({ entityId: String(application.id), applicationId: String(application.id) })
      return res.redirect(`${URLS.LOG_SUBMIT_APPLICATION}/${applicationData.prisonerId}/${application.id}`)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
