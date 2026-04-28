import { randomUUID } from 'crypto'
import { ApplicationData } from 'express-session'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import DocumentManagementService from './documentManagementService'
import DocumentManagementApiClient from '../data/documentManagementApiClient'

jest.mock('../data/documentManagementApiClient')

describe('DocumentManagementService', () => {
  const mockClient = new DocumentManagementApiClient(
    {} as AuthenticationClient,
  ) as jest.Mocked<DocumentManagementApiClient>
  let service: DocumentManagementService

  beforeEach(() => {
    service = new DocumentManagementService(mockClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('uploadDocument', () => {
    it('should call API client to upload photos from session', async () => {
      const photo1Data = {
        buffer: Buffer.from('/9j/4AAQSkZJRg...', 'base64'),
        filename: 'photo1.jpg',
        mimetype: 'image/jpeg',
      }

      const applicationData: ApplicationData = {
        photos: {
          photo1: photo1Data,
        },
      }

      const expectedDocument = {
        documentUuid: 'some-uuid',
        documentType: 'PRISONER_APPLICATION',
        documentFilename: 'photo1.jpg',
        mimeType: 'image/jpeg',
      }

      // @ts-expect-error - we're only interested in testing the service's handling of the API response, not the client's implementation
      mockClient.uploadDocument.mockResolvedValue([expectedDocument])

      const result = await service.uploadDocument(applicationData, {
        username: 'TEST_USER',
        activeCaseLoadId: 'MDI',
      })

      expect(mockClient.uploadDocument).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            file: expect.any(Buffer),
            filename: 'photo1.jpg',
            mimeType: 'image/jpeg',
            documentUuid: expect.any(String),
            metadata: {
              establishment: 'MDI',
            },
          }),
        ],
        {
          username: 'TEST_USER',
          activeCaseLoadId: 'MDI',
        },
      )
      expect(result).toEqual([expectedDocument])
    })

    it('should return empty array if no photos in session', async () => {
      const username = 'TEST_USER'
      const result = await service.uploadDocument({} as ApplicationData, {
        username,
      })

      expect(result).toEqual([])
      expect(mockClient.uploadDocument).not.toHaveBeenCalled()
    })
  })

  describe('getDocument', () => {
    it('should fetch a document via API client', async () => {
      const username = 'TEST_USER'
      const activeCaseLoadId = 'MDI'
      const documentUuid = randomUUID()
      const fakeDoc = {
        documentUuid,
        documentFilename: 'file.jpg',
        fileSize: 1234,
        mimeType: 'image/jpeg',
        createdTime: '2024-01-01T00:00:00Z',
      }
      // @ts-expect-error - we're only interested in testing the service's handling of the API response, not the client's implementation
      mockClient.getDocument.mockResolvedValue(fakeDoc)

      const result = await service.getDocument(documentUuid, username, activeCaseLoadId)

      expect(result).toEqual(fakeDoc)
      expect(mockClient.getDocument).toHaveBeenCalledWith(documentUuid, {
        username: 'TEST_USER',
        activeCaseLoadId: 'MDI',
      })
    })
  })

  describe('downloadDocument', () => {
    it('should return file buffer from API client', async () => {
      const username = 'TEST_USER'
      const activeCaseLoadId = 'MDI'
      const documentUuid = randomUUID()
      const buffer = Buffer.from('file content')
      mockClient.downloadDocument.mockResolvedValue(buffer)

      const result = await service.downloadDocument(documentUuid, username, activeCaseLoadId)

      expect(result).toEqual(buffer)
      expect(mockClient.downloadDocument).toHaveBeenCalledWith(documentUuid, {
        username: 'TEST_USER',
        activeCaseLoadId: 'MDI',
      })
    })
  })
})
