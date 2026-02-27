import { randomUUID } from 'crypto'
import superagent from 'superagent'
import logger from '../../logger'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import { Document, DocumentType } from '../@types/documentManagementApi'

export interface UploadDocumentRequest {
  file: Buffer
  filename: string
  mimeType: string
  documentUuid?: string
  metadata?: Record<string, string>
}

const DOCUMENT_TYPE: DocumentType = 'PRISONER_APPLICATION'
const SERVICE_NAME = 'hmpps-managing-prisoner-apps'

export default class DocumentManagementApiClient {
  private restClient: RestClient

  private apiConfig: ApiConfig

  private token: string

  constructor(token: string) {
    this.restClient = new RestClient('documentManagementApiClient', config.apis.documentApi as ApiConfig, token)
    this.apiConfig = config.apis.documentApi as ApiConfig
    this.token = token
  }

  private getToken(): string {
    return this.token
  }

  async uploadDocument(requests: UploadDocumentRequest[]): Promise<Document[]> {
    const token = this.getToken()

    if (!requests || requests.length === 0) {
      logger.info('No documents to upload')
      return []
    }

    logger.info(`Uploading ${requests.length} document(s) to Document Management API`)

    const uploadPromises = requests.map(async request => {
      const documentUuid = request.documentUuid ?? randomUUID()

      try {
        const result = await superagent
          .post(`${this.apiConfig.url}/documents/${DOCUMENT_TYPE}/${documentUuid}`)
          .attach('file', request.file, {
            filename: request.filename,
            contentType: request.mimeType,
          })
          .field('metadata', JSON.stringify(request.metadata || {}))
          .auth(token, { type: 'bearer' })
          .set('Service-Name', SERVICE_NAME)
          .timeout(this.apiConfig.timeout)

        logger.info(`Successfully uploaded document ${documentUuid} (${request.filename})`)
        return result.body as Document
      } catch (error) {
        logger.error(`Error uploading document ${request.filename}:`, error)
        return null
      }
    })

    const results = await Promise.allSettled(uploadPromises)

    const successfullUploads = results
      .filter((r): r is PromiseFulfilledResult<Document> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value)

    logger.info(`Successfully uploaded ${successfullUploads.length}/${requests.length} document(s)`)
    return successfullUploads
  }

  async getDocument(documentUuid: string): Promise<Document | null> {
    try {
      return await this.restClient.get({
        path: `/documents/${documentUuid}`,
        headers: {
          'Service-Name': 'hmpps-managing-prisoner-apps',
        },
      })
    } catch (error) {
      logger.error(`Error fetching document ${documentUuid}:`, error)
      return null
    }
  }

  async downloadDocument(documentUuid: string): Promise<Buffer | null> {
    const token = this.getToken()

    const url = `${this.apiConfig.url}/documents/${documentUuid}/file`

    try {
      const result = await superagent
        .get(url)
        .auth(token, { type: 'bearer' })
        .set('Service-Name', SERVICE_NAME)
        .responseType('blob')
        .timeout(this.apiConfig.timeout)

      if (Buffer.isBuffer(result.body)) {
        logger.info(`Successfully downloaded document ${documentUuid}, size: ${result.body.length} bytes`)
        return result.body
      }

      if (result.body) {
        const buffer = Buffer.from(result.body)
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
