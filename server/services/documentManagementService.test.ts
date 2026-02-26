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
  const token = 'auth-token'

  beforeEach(() => {
    const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new DocumentManagementService(hmppsAuthClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('uploadDocument', () => {
    it('should call API client to upload photos from session', async () => {
      const applicationData = {
        photos: {
          photo1: { buffer: Buffer.from('abc'), filename: 'photo1.jpg', mimetype: 'image/jpeg' },
        },
        photoAdditionalDetails: 'Test details',
      }

      const metadata = { username }

      const mockUploadedDoc = {
        documentUuid: randomUUID(),
        documentFilename: 'photo1.jpg',
        mimeType: 'image/jpeg',
        fileSize: 123,
        createdTime: '2024-01-01T00:00:00Z',
      }

      mockClientMethods.uploadDocument.mockResolvedValue([mockUploadedDoc])

      const result = await service.uploadDocument(applicationData as ApplicationData, metadata)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockUploadedDoc)

      expect(mockClientMethods.uploadDocument).toHaveBeenCalledTimes(1)
      const uploadRequests = mockClientMethods.uploadDocument.mock.calls[0][0]

      expect(uploadRequests).toHaveLength(1)

      expect(uploadRequests[0]).toMatchObject({
        file: expect.any(Buffer),
        filename: 'photo1.jpg',
        mimeType: 'image/jpeg',
        documentUuid: expect.any(String),
        metadata: {
          uploadedBy: username,
          photoAdditionalDetails: 'Test details',
        },
      })

      expect(uploadRequests[0].file.toString()).toBe('abc')
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

      const result = await service.getDocument(documentUuid, username)

      expect(result).toEqual(fakeDoc)
      expect(mockClientMethods.getDocument).toHaveBeenCalledWith(documentUuid)
    })
  })

  describe('downloadDocument', () => {
    it('should return file buffer from API client', async () => {
      const documentUuid = randomUUID()
      const buffer = Buffer.from('file content')
      mockClientMethods.downloadDocument.mockResolvedValue(buffer)

      const result = await service.downloadDocument(documentUuid, username)

      expect(result).toEqual(buffer)
      expect(mockClientMethods.downloadDocument).toHaveBeenCalledWith(documentUuid)
    })
  })
})
