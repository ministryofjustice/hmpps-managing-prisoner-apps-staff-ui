import { randomUUID } from 'crypto'
import { ApplicationData } from 'express-session'
import HmppsAuthClient from '../data/hmppsAuthClient'
import DocumentManagementService from './documentManagementService'

const mockClientMethods = {
  uploadDocument: jest.fn(),
  getDocument: jest.fn(),
  downloadDocument: jest.fn(),
  deleteDocument: jest.fn(),
}

jest.mock('../data/documentManagementApiClient', () => {
  return jest.fn().mockImplementation(() => mockClientMethods)
})

jest.mock('../data/hmppsAuthClient')

describe('DocumentManagementService', () => {
  let service: DocumentManagementService
  const username = 'TEST_USER'
  const activeCaseLoadId = 'MDI'
  const token = 'auth-token'

  beforeEach(() => {
    const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new DocumentManagementService(hmppsAuthClient)
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
        documentFilename: 'photo1.jpg',
        mimeType: 'image/jpeg',
      }

      mockClientMethods.uploadDocument.mockResolvedValue([expectedDocument])

      const result = await service.uploadDocument(applicationData, {
        username: 'TEST_USER',
        activeCaseLoadId: 'MDI',
      })

      expect(mockClientMethods.uploadDocument).toHaveBeenCalledWith(
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
      const result = await service.uploadDocument({} as ApplicationData, {
        username,
      })

      expect(result).toEqual([])
      expect(mockClientMethods.uploadDocument).not.toHaveBeenCalled()
    })
  })

  describe('getDocument', () => {
    it('should fetch a document via API client', async () => {
      const documentUuid = randomUUID()
      const fakeDoc = {
        documentUuid,
        documentFilename: 'file.jpg',
        fileSize: 1234,
        mimeType: 'image/jpeg',
        createdTime: '2024-01-01T00:00:00Z',
      }
      mockClientMethods.getDocument.mockResolvedValue(fakeDoc)

      const result = await service.getDocument(documentUuid, username, activeCaseLoadId)

      expect(result).toEqual(fakeDoc)
      expect(mockClientMethods.getDocument).toHaveBeenCalledWith(documentUuid, {
        username: 'TEST_USER',
        activeCaseLoadId: 'MDI',
      })
    })
  })

  describe('downloadDocument', () => {
    it('should return file buffer from API client', async () => {
      const documentUuid = randomUUID()
      const buffer = Buffer.from('file content')
      mockClientMethods.downloadDocument.mockResolvedValue(buffer)

      const result = await service.downloadDocument(documentUuid, username, activeCaseLoadId)

      expect(result).toEqual(buffer)
      expect(mockClientMethods.downloadDocument).toHaveBeenCalledWith(documentUuid, {
        username: 'TEST_USER',
        activeCaseLoadId: 'MDI',
      })
    })
  })
})
