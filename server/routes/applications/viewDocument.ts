import { Request, Response, Router } from 'express'

import DocumentManagementService from '../../services/documentManagementService'
import logger from '../../../logger'
import { URLS } from '../../constants/urls'

export default function viewDocumentRouter({
  documentManagementService,
}: {
  documentManagementService: DocumentManagementService
}): Router {
  const router = Router()

  router.get(
    `${URLS.APPLICATIONS}/:prisonerId/:applicationId/documents/:documentUuid`,
    async (req: Request, res: Response) => {
      const { prisonerId, applicationId, documentUuid } = req.params
      const { user } = res.locals

      try {
        const document = await documentManagementService.getDocument(documentUuid as string, user.username)
        if (!document) {
          res.status(404).send('Document not found')
          return
        }
        const fileBuffer = await documentManagementService.downloadDocument(documentUuid as string, user.username)

        res.set('Content-Type', document.mimeType)
        res.set('Content-Disposition', `inline; filename="${document.documentFilename}"`)
        res.send(fileBuffer)
        logger.info(`Document served successfully: ${documentUuid}`)
      } catch (error) {
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
