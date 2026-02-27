import { randomUUID } from 'crypto'
import { ApplicationData } from 'express-session'
import logger from '../../logger'
import { HmppsAuthClient } from '../data'
import DocumentManagementApiClient from '../data/documentManagementApiClient'
import { Document } from '../@types/documentManagementApi'

export default class DocumentManagementService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async uploadDocument(
    applicationData: ApplicationData,
    metadata: {
      username: string
    },
  ): Promise<Document[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(metadata.username)
    const documentManagementApiClient = new DocumentManagementApiClient(token)

    const { photos, photoAdditionalDetails } = applicationData

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
          uploadedBy: metadata.username,
          photoAdditionalDetails: photoAdditionalDetails || '',
        },
      }
    })

    logger.info(`Uploading ${uploadRequests.length} photos`)

    const uploadedDocuments = await documentManagementApiClient.uploadDocument(uploadRequests)
    return uploadedDocuments || []
  }

  async getDocument(documentUuid: string, username: string): Promise<Document> {
    try {
      const token = await this.hmppsAuthClient.getSystemClientToken(username)
      const documentManagementApiClient = new DocumentManagementApiClient(token)

      const document = await documentManagementApiClient.getDocument(documentUuid)

      logger.info(`Successfully fetched document ${documentUuid}`)

      return document
    } catch (error) {
      logger.error(`Error fetching document ${documentUuid}:`, error)
      throw error
    }
  }

  async downloadDocument(documentUuid: string, username: string): Promise<Buffer | null> {
    try {
      const token = await this.hmppsAuthClient.getSystemClientToken(username)
      const documentManagementApiClient = new DocumentManagementApiClient(token)

      const fileBuffer = await documentManagementApiClient.downloadDocument(documentUuid)

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
