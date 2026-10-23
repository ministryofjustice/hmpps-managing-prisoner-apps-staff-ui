import { Request, Response, Router } from 'express'

import { auditEventLoggers } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import DocumentManagementService from '../../services/documentManagementService'
import logger from '../../../logger'
import { URLS } from '../../constants/urls'
import AuditService from '../../services/auditService'

export default function viewDocumentRouter({
  auditService,
  documentManagementService,
}: {
  auditService: AuditService
  documentManagementService: DocumentManagementService
}): Router {
  const router = Router()

  router.get(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/documents/:documentUuid`,
    async (req: Request, res: Response) => {
      const { prisonerId, applicationId, documentUuid } = req.params
      const { user } = res.locals
      const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
        'VIEW_APPLICATION_DOCUMENT',
        async (what, extraDetails = {}) =>
          auditService.logAuditEvent({
            what,
            who: user.username,
            correlationId: String(req.id),
            subjectId: String(prisonerId),
            subjectType: 'PRISONER_ID',
            details: { entityId: applicationId, applicationId, documentUuid, ...extraDetails },
          }),
      )

      await logAttempt()
      try {
        const document = await documentManagementService.getDocument(documentUuid as string, user.username)
        if (!document) {
          await logFailure({ failureReason: 'Document not found' })
          res.status(404).send('Document not found')
          return
        }
        const fileBuffer = await documentManagementService.downloadDocument(documentUuid as string, user.username)

        await logSuccess()
        res.set('Content-Type', document.mimeType)
        res.set('Content-Disposition', `inline; filename="${document.documentFilename}"`)
        res.send(fileBuffer)
        logger.info(`Document served successfully: ${documentUuid}`)
      } catch (error) {
        await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
        logger.error(
          `Error fetching document ${documentUuid} for prisoner ${prisonerId} and application ${applicationId}:`,
          error,
        )
        res.status(500).send('Error fetching document')
      }
    },
  )

  return router
}
