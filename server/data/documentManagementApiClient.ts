import { randomUUID } from 'crypto'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'
import config from '../config'
import { Document, DocumentType } from '../@types/documentManagementApi'

export interface UploadDocumentRequest {
  file: Buffer
  filename: string
  mimeType: string
  documentUuid?: string
  metadata?: Record<string, string>
}

export interface DocumentHeaders {
  username?: string
  activeCaseLoadId?: string
}

const DOCUMENT_TYPE: DocumentType = 'PRISONER_APPLICATION'
const SERVICE_NAME = 'hmpps-managing-prisoner-apps'

/* eslint-disable  @typescript-eslint/no-explicit-any */
export default class DocumentManagementApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('documentManagementApiClient', config.apis.documentApi, logger, authenticationClient)
  }

  async uploadDocument(requests: UploadDocumentRequest[], headers?: DocumentHeaders): Promise<Document[]> {
    if (!requests || requests.length === 0) {
      logger.info('No documents to upload')
      return []
    }

    logger.info(`Uploading ${requests.length} document(s) to Document Management API`)

    const uploadPromises = requests.map(async request => {
      const documentUuid = request.documentUuid ?? randomUUID()
      const requestHeaders: Record<string, string> = {
        'Service-Name': SERVICE_NAME,
        'Content-Type': request.mimeType,
      }
      if (headers?.username) {
        requestHeaders['User-Name'] = headers.username
      }
      if (headers?.activeCaseLoadId) {
        requestHeaders['Active-Case-Load-Id'] = headers.activeCaseLoadId
      }
      try {
        const result = await this.post<any>(
          {
            path: `/documents/${DOCUMENT_TYPE}/${documentUuid}`,
            headers: requestHeaders,
            multipartData: { metadata: JSON.stringify(request.metadata || {}), contentType: request.mimeType },
            files: {
              file: {
                buffer: request.file,
                originalname: request.filename,
              },
            },
          },
          asSystem(),
        )

        logger.info(`Successfully uploaded document ${documentUuid} (${request.filename})`)
        return result as Document
      } catch (error) {
        logger.error(`Error uploading document ${request.filename}:`, error)
        return null
      }
    })

    const results = await Promise.allSettled(uploadPromises)

    const successfulUploads = results
      .filter((r): r is PromiseFulfilledResult<Document> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value)

    logger.info(`Successfully uploaded ${successfulUploads.length}/${requests.length} document(s)`)
    return successfulUploads
  }

  async getDocument(documentUuid: string, headers?: DocumentHeaders): Promise<Document | null> {
    const requestHeaders: Record<string, string> = {
      'Service-Name': SERVICE_NAME,
    }
    if (headers?.username) {
      requestHeaders['User-Name'] = headers.username
    }
    if (headers?.activeCaseLoadId) {
      requestHeaders['Active-Case-Load-Id'] = headers.activeCaseLoadId
    }

    try {
      return await this.get(
        {
          path: `/documents/${documentUuid}`,
          headers: requestHeaders,
        },
        asSystem(),
      )
    } catch (error) {
      logger.error(`Error fetching document ${documentUuid}:`, error)
      return null
    }
  }

  async downloadDocument(documentUuid: string, headers?: DocumentHeaders): Promise<Buffer | null> {
    const url = `/documents/${documentUuid}/file`
    const requestHeaders: Record<string, string> = {
      'Service-Name': SERVICE_NAME,
    }
    if (headers?.username) {
      requestHeaders['User-Name'] = headers.username
    }
    if (headers?.activeCaseLoadId) {
      requestHeaders['Active-Case-Load-Id'] = headers.activeCaseLoadId
    }

    try {
      const result = await this.get<any>({ path: url, headers: requestHeaders, responseType: 'blob' }, asSystem())
      if (Buffer.isBuffer(result)) {
        logger.info(`Successfully downloaded document ${documentUuid}, size: ${result.length} bytes`)
        return result
      }

      if (result) {
        const buffer = Buffer.from(result)
        logger.info(`Successfully downloaded document ${documentUuid}, size: ${buffer.length} bytes`)
        return buffer
      }

      logger.error(`Downloaded document ${documentUuid} has no body`)
      return null
    } catch (error) {
      logger.error(`Error downloading document ${documentUuid}:`, error)
      return null
    }
  }
}
