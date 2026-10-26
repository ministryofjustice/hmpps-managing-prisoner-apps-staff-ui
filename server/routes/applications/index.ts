import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { Request, Response, Router } from 'express'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { isLogNewApplicationDisabledEstablishment } from '../../constants/enabledEstablishments'
import AuditService from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'
import PrisonService from '../../services/prisonService'
import DocumentManagementService from '../../services/documentManagementService'

import actionAppRouter from './actionApp'
import appDetailsRouter from './appDetails'
import appTypeRouter from './appType'
import changeAppRouter from './changeApp'
import commentsRouter from './comments'
import confirmAppRouter from './confirmApp'
import departmentsRouter from './departments'
import forwardAppRouter from './forwardApp'
import groupsRouter from './groups'
import historyRouter from './history'
import messagesRouter from './messages'
import prisonerRouter from './prisoner'
import printReplyRouter from './printReply'
import submitAppRouter from './submitApp'
import viewDocumentRouter from './viewDocument'
import viewAppsRouter from './view'
import logMethodRouter from './logMethod'
import photoCaptureRouter from './photoCapture'
import confirmPhotoRouter from './confirmPhoto'
import anotherPhotoRouter from './anotherPhoto'
import additionalPhotoDetailsRouter from './additionalPhotoDetails'
import removePhotoRouter from './removePhoto'
import cancelAppRouter from './cancelApp'
import { setListQueryLocals } from '../../utils/http/filters'

export default function applicationsRoutes({
  auditService,
  managingPrisonerAppsService,
  documentManagementService,
  prisonService,
  personalRelationshipsService,
  osPlacesAddressService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  documentManagementService: DocumentManagementService
  prisonService: PrisonService
  personalRelationshipsService: PersonalRelationshipsService
  osPlacesAddressService?: OsPlacesAddressService
}): Router {
  const router = Router()

  router.get('/', async (req: Request, res: Response) => {
    const { user } = res.locals

    await auditLogged(
      'VIEW_APPLICATIONS_HOME',
      async (what, details = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details,
        }),
      async () => {
        res.render('pages/applications', {
          title: 'Applications',
          canLogNewApplication:
            user.authSource !== 'nomis' || !isLogNewApplicationDisabledEstablishment(user.activeCaseLoadId),
        })
      },
    )
  })

  router.use(viewDocumentRouter({ auditService, documentManagementService }))

  router.use('/applications/:prisonerId/:applicationId', setListQueryLocals)

  router.use(actionAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(
    appDetailsRouter({
      auditService,
      managingPrisonerAppsService,
      personalRelationshipsService,
      osPlacesAddressService,
    }),
  )
  router.use(appTypeRouter({ auditService, managingPrisonerAppsService }))
  router.use(
    changeAppRouter({
      auditService,
      managingPrisonerAppsService,
      personalRelationshipsService,
      osPlacesAddressService,
    }),
  )
  router.use(commentsRouter({ auditService, managingPrisonerAppsService }))
  router.use(confirmAppRouter({ auditService, managingPrisonerAppsService, documentManagementService }))
  router.use(departmentsRouter({ auditService, managingPrisonerAppsService }))
  router.use(forwardAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(groupsRouter({ auditService, managingPrisonerAppsService }))
  router.use(historyRouter({ auditService, managingPrisonerAppsService }))
  router.use(messagesRouter({ auditService, managingPrisonerAppsService }))
  router.use(prisonerRouter({ auditService, prisonService }))
  router.use(printReplyRouter({ auditService, managingPrisonerAppsService }))
  router.use(submitAppRouter({ auditService, managingPrisonerAppsService }))
  router.use(viewAppsRouter({ auditService, managingPrisonerAppsService, prisonService, documentManagementService }))
  router.use(logMethodRouter({ auditService }))
  router.use(photoCaptureRouter({ auditService }))
  router.use(confirmPhotoRouter({ auditService }))
  router.use(anotherPhotoRouter({ auditService }))
  router.use(additionalPhotoDetailsRouter({ auditService }))
  router.use(removePhotoRouter({ auditService }))
  router.use(cancelAppRouter({ auditService }))
  router.get('/api/addresses/find/:query', async (req: Request, res: Response) => {
    const { user } = res.locals
    const { query } = req.params
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'SEARCH_ADDRESS',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(query || ''),
          subjectType: 'SEARCH_TERM',
          details: { queryParams: req.query, ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      if (!query) {
        await logFailure({ failureReason: 'Query parameter is required' })
        res.status(400).json({ status: 400, error: 'Query parameter is required' })
        return
      }

      const results = await osPlacesAddressService.getAddressesMatchingQuery(query as string)

      res.locals.auditDetails = {
        results: {
          resultCount: results.length,
          returnedSubjectIds: results
            .filter(address => address.uprn !== undefined)
            .map(address => String(address.uprn)),
        },
      }

      await logSuccess(res.locals.auditDetails)
      res.json({ status: 200, results })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await logFailure({ failureReason: errorMessage })
      res.status(500).json({ status: 500, error: errorMessage })
    }
  })

  return router
}
