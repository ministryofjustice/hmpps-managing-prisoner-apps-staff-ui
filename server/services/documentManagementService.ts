import { randomUUID } from 'crypto'
import { ApplicationData } from 'express-session'
import logger from '../../logger'
import DocumentManagementApiClient from '../data/documentManagementApiClient'
import { Document } from '../@types/documentManagementApi'

export default class DocumentManagementService {
  constructor(private readonly documentManagementApiClient: DocumentManagementApiClient) {}

  async uploadDocument(
    applicationData: ApplicationData,
    metadata: {
      username: string
      activeCaseLoadId?: string
    },
  ): Promise<Document[]> {
    const { photos } = applicationData

    if (!photos || Object.keys(photos).length === 0) {
      logger.info(`No photos to upload`)
      return []
    }

    const uploadRequests = Object.entries(photos).map(([photoKey, photo]) => {
      let fileBuffer: Buffer
      if (Buffer.isBuffer(photo.buffer)) fileBuffer = photo.buffer
      else if (typeof photo.buffer === 'string') fileBuffer = Buffer.from(photo.buffer, 'base64')
      else {
        throw new Error(`Invalid buffer type for photo ${photoKey}  `)
      }
      const documentUuid = randomUUID()
      return {
        file: fileBuffer,
        filename: photo.filename,
        mimeType: photo.mimetype,
        documentUuid,
        metadata: {
          establishment: metadata.activeCaseLoadId,
        },
      }
    })

    logger.info(`Uploading ${uploadRequests.length} photos`)

    const uploadedDocuments = await this.documentManagementApiClient.uploadDocument(uploadRequests, {
      username: metadata.username,
      activeCaseLoadId: metadata.activeCaseLoadId,
    })

    return uploadedDocuments || []
  }

  async getDocument(documentUuid: string, username: string, activeCaseLoadId?: string): Promise<Document> {
    try {
      const document = await this.documentManagementApiClient.getDocument(documentUuid, { username, activeCaseLoadId })
      logger.info(`Successfully fetched document ${documentUuid}`)

      return document
    } catch (error) {
      logger.error(`Error fetching document ${documentUuid}:`, error)
      throw error
    }
  }

  async downloadDocument(documentUuid: string, username: string, activeCaseLoadId?: string): Promise<Buffer | null> {
    try {
      const fileBuffer = await this.documentManagementApiClient.downloadDocument(documentUuid, {
        username,
        activeCaseLoadId,
      })

      if (!fileBuffer) {
        return null
      }

      logger.info(`Successfully downloaded document ${documentUuid}, size: ${fileBuffer.length} bytes`)
      return fileBuffer
    } catch (error) {
      logger.error(`Error downloading document ${documentUuid}:`, error)
      return null
    }
  }
}
