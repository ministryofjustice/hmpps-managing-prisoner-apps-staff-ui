import { Request, Response, Router } from 'express'
import { AddNewOfficialPinPhoneContactDetails } from 'express-session'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

import { getAppType } from '../../helpers/application/getAppType'
import formatEarlyDaysCentre from '../../utils/formatters/formatEarlyDaysCentre'
import getApplicationDetails from '../../utils/getAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import { convertToTitleCase } from '../../utils/utils'

export default function changeAppRouter({
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

  router.get(`${URLS.APPLICATIONS}/:prisonerId/:applicationId/change`, async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { applicationData } = req.session
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_CHANGE_APPLICATION',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: { entityId: applicationId, applicationId, ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const validApplication = await getValidApplicationOrRedirect(req, res, managingPrisonerAppsService)
      if (!validApplication) {
        await logFailure({ failureReason: 'Application not valid' })
        return
      }
      const { application, applicationType } = validApplication

      const isGeneric = Boolean(applicationType.genericType || applicationType.genericForm)
      const additionalData = applicationData?.additionalData || {}
      const formData = getAppTypeLogDetailsData(application.applicationType.id, additionalData, isGeneric)
      const earlyDaysCentreValue = formatEarlyDaysCentre(applicationData?.earlyDaysCentre, application.firstNightCenter)

      const templateData = await getApplicationDetails(
        formData,
        personalRelationshipsService,
        application,
        earlyDaysCentreValue,
        isGeneric,
      )

      await logSuccess()
      res.render(PATHS.APPLICATIONS.CHANGE_DETAILS, {
        application,
        applicationType: applicationType.name
          .replace(/[^\w\s]/g, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        backLink: `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}`,
        title: applicationType.name,
        errors: null,
        ...templateData,
        isGeneric,
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(`${URLS.APPLICATIONS}/:prisonerId/:applicationId/change`, async (req, res) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals
    const { applicationData } = req.session
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_APPLICATION_DRAFT',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: {
            entityId: applicationId,
            applicationId,
            changes: [{ field: 'formData' }, { field: 'firstNightCenter' }],
            ...extraDetails,
          },
        }),
    )

    await logAttempt()
    try {
      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
      const applicationType = await getAppType(
        managingPrisonerAppsService,
        user,
        application.applicationType.id.toString(),
      )
      req.session.applicationData = {
        ...req.session.applicationData,
        loggingMethod: 'manual',
      }
      await handleApplicationDetails(req, res, {
        getAppType: () => applicationType,
        getTemplateData: async () => {
          const additionalData = applicationData?.additionalData || {}

          const formData = getAppTypeLogDetailsData(
            applicationType.id,
            additionalData,
            applicationType.genericType || applicationType.genericForm,
          )

          const templateData = await getApplicationDetails(
            formData,
            personalRelationshipsService,
            application,
            applicationData?.earlyDaysCentre,
          )

          return {
            application,
            applicationType: applicationType.name
              .replace(/[^\w\s]/g, '')
              .trim()
              .toLowerCase()
              .replace(/\s+/g, '-'),
            isGeneric: Boolean(applicationType.genericType || applicationType.genericForm),
            backLink: `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}`,
            ...templateData,
          }
        },
        isUpdate: true,
        renderPath: PATHS.APPLICATIONS.CHANGE_DETAILS,
        successRedirect: () => `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/change/confirm`,
        osPlacesAddressService,
      })
      if (res.getHeader('location')) await logSuccess()
      else await logFailure({ failureReason: 'Validation failed' })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.get(`${URLS.APPLICATIONS}/:prisonerId/:applicationId/change/confirm`, async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { applicationData } = req.session
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_CONFIRM_APPLICATION_CHANGE',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: { entityId: applicationId, applicationId, ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const validApplication = await getValidApplicationOrRedirect(req, res, managingPrisonerAppsService)
      if (!validApplication) {
        await logFailure({ failureReason: 'Application not valid' })
        return
      }
      const { application, applicationType } = validApplication

      await logSuccess()
      res.render(PATHS.LOG_APPLICATION.CONFIRM_DETAILS, {
        application,
        applicationType: applicationType.name
          .replace(/[^\w\s]/g, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        applicationData: {
          prisoner: `${application.requestedBy.firstName} ${application.requestedBy.lastName}`,
          earlyDaysCentre: formatEarlyDaysCentre(applicationData?.earlyDaysCentre, application.firstNightCenter, true),
          request: applicationData.additionalData,
          type: applicationType,
          group: application.applicationGroup.name,
          department: application.assignedGroup.name,
        },
        backLink: `${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/change`,
        isUpdate: true,
        title: applicationType.name,
        isGeneric: applicationType.genericType || applicationType.genericForm,
        loggingMethod: applicationData?.loggingMethod,
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.post(`${URLS.APPLICATIONS}/:prisonerId/:applicationId/change/confirm`, async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { applicationData } = req.session
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_APPLICATION',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: {
            entityId: applicationId,
            applicationId,
            changes: [{ field: 'formData' }, { field: 'firstNightCenter' }],
            ...extraDetails,
          },
        }),
    )

    await logAttempt()
    try {
      const application = await managingPrisonerAppsService.getPrisonerApp(`${prisonerId}`, `${applicationId}`, user)

      if (!application) {
        await logFailure({ failureReason: 'Application not found' })
        return res.redirect(URLS.APPLICATIONS)
      }

      const payload = {
        firstNightCenter: applicationData?.earlyDaysCentre === 'yes',
        formData: [
          {
            ...(applicationData?.additionalData as Record<string, unknown>),
            company:
              (applicationData?.additionalData as Partial<AddNewOfficialPinPhoneContactDetails>).organisation || '',
            id: application.requests[0].id,
          },
        ],
      }

      await managingPrisonerAppsService.changeApp(`${prisonerId}`, `${applicationId}`, payload, user)

      const prisonerContext = prisonerId && {
        prisonerId: `${prisonerId}`,
        prisonerName: convertToTitleCase(`${application.requestedBy.firstName} ${application.requestedBy.lastName}`),
      }

      delete req.session.applicationData

      if (prisonerContext) {
        req.session.prisonerContext = prisonerContext
      }

      await logSuccess()
      return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/change/submit`)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  router.get(`${URLS.APPLICATIONS}/:prisonerId/:applicationId/change/submit`, async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'VIEW_SUBMIT_APPLICATION_CHANGE',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(prisonerId),
          subjectType: 'PRISONER_ID',
          details: { entityId: applicationId, applicationId, ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const validApplication = await getValidApplicationOrRedirect(req, res, managingPrisonerAppsService)
      if (!validApplication) {
        await logFailure({ failureReason: 'Application not valid' })
        return
      }
      const { application, applicationType } = validApplication

      await logSuccess()
      res.render(PATHS.LOG_APPLICATION.SUBMIT, {
        title: applicationType.name,
        application,
        isUpdated: true,
        prisonerName: convertToTitleCase(`${application.requestedBy.firstName} ${application.requestedBy.lastName}`),
      })
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
