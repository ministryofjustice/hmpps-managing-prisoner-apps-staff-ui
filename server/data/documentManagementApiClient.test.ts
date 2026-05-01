import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import nock from 'nock'
import DocumentManagementApiClient from './documentManagementApiClient'
import { mockDocument, mockDocuments } from '../testData'
import config from '../config'

describe('DocumentManagementApiClient', () => {
  let fakeDocumentManagementApi: nock.Scope
  let client: DocumentManagementApiClient
  let mockAuthenticationClientInstance: jest.Mocked<AuthenticationClient>
  const token = 'test-token'

  beforeEach(() => {
    mockAuthenticationClientInstance = {
      getToken: jest.fn().mockResolvedValue(token),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakeDocumentManagementApi = nock(config.apis.documentApi.url)
    client = new DocumentManagementApiClient(mockAuthenticationClientInstance)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('uploadDocument', () => {
    it('should upload a single document successfully', async () => {
      const mockUploadRequest = {
        file: Buffer.from('test content'),
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        documentUuid: 'uuid-1234',
      }

      fakeDocumentManagementApi
        .post('/documents/PRISONER_APPLICATION/uuid-1234')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockDocument)

      const result = await client.uploadDocument([mockUploadRequest])

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockDocument)
    })

    it('should upload multiple documents successfully', async () => {
      const mockRequests = [
        {
          file: Buffer.from('file1'),
          filename: 'photo1.jpg',
          mimeType: 'image/jpeg',
          documentUuid: 'uuid-1',
        },
        {
          file: Buffer.from('file2'),
          filename: 'photo2.jpg',
          mimeType: 'image/jpeg',
          documentUuid: 'uuid-2',
        },
      ]

      fakeDocumentManagementApi
        .post('/documents/PRISONER_APPLICATION/uuid-1')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockDocuments[0])

      fakeDocumentManagementApi
        .post('/documents/PRISONER_APPLICATION/uuid-2')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockDocuments[1])

      const result = await client.uploadDocument(mockRequests)

      expect(result).toHaveLength(2)
      expect(result).toEqual(mockDocuments)
    })

    it('should handle upload errors gracefully', async () => {
      const mockUploadRequest = {
        file: Buffer.from('test'),
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        documentUuid: 'uuid-error',
      }

      fakeDocumentManagementApi
        .post('/documents/PRISONER_APPLICATION/uuid-error')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(400, new Error('Upload failed'))

      const result = await client.uploadDocument([mockUploadRequest])

      expect(result).toEqual([])
    })

    it('should return empty array when no requests provided', async () => {
      const result = await client.uploadDocument([])
      expect(result).toEqual([])
    })

    it('should generate UUID if not provided', async () => {
      const mockUploadRequest = {
        file: Buffer.from('test'),
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
      }

      fakeDocumentManagementApi
        .post(/^\/documents\/PRISONER_APPLICATION\/[a-f0-9-]{36}/)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockDocument)

      const result = await client.uploadDocument([mockUploadRequest])

      expect(result).toHaveLength(1)
    })

    it('should handle partial failures', async () => {
      const mockRequests = [
        {
          file: Buffer.from('file1'),
          filename: 'photo1.jpg',
          mimeType: 'image/jpeg',
          documentUuid: 'uuid-success',
        },
        {
          file: Buffer.from('file2'),
          filename: 'photo2.jpg',
          mimeType: 'image/jpeg',
          documentUuid: 'uuid-fail',
        },
      ]

      fakeDocumentManagementApi
        .post('/documents/PRISONER_APPLICATION/uuid-success')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockDocuments[0])

      fakeDocumentManagementApi
        .post('/documents/PRISONER_APPLICATION/uuid-fail')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(400, new Error('Failed'))

      const result = await client.uploadDocument(mockRequests)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockDocuments[0])
    })
  })

  describe('getDocument', () => {
    it('should retrieve a document by UUID successfully', async () => {
      fakeDocumentManagementApi
        .get('/documents/uuid-1234')
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Service-Name', 'hmpps-managing-prisoner-apps')
        .reply(200, mockDocument)

      const result = await client.getDocument('uuid-1234')

      expect(result).toEqual(mockDocument)
    })

    it('should handle errors when getting document fails', async () => {
      fakeDocumentManagementApi
        .get('/documents/invalid-uuid')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(404, new Error('Document not found'))

      const result = await client.getDocument('invalid-uuid')

      expect(result).toBeNull()
    })

    it('should handle 404 errors', async () => {
      fakeDocumentManagementApi
        .get('/documents/non-existent-uuid')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(404, new Error('Not Found'))

      const result = await client.getDocument('non-existent-uuid')

      expect(result).toBeNull()
    })

    it('should retrieve multiple documents', async () => {
      fakeDocumentManagementApi
        .get('/documents/uuid-1')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockDocuments[0])

      fakeDocumentManagementApi
        .get('/documents/uuid-2')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockDocuments[1])

      const result1 = await client.getDocument('uuid-1')
      const result2 = await client.getDocument('uuid-2')

      expect(result1).toEqual(mockDocuments[0])
      expect(result2).toEqual(mockDocuments[1])
    })
  })

  describe('downloadDocument', () => {
    it('should download a document successfully as Buffer', async () => {
      const mockImageBuffer = Buffer.from('mock image data')

      fakeDocumentManagementApi
        .get('/documents/uuid-1234/file')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockImageBuffer)

      const result = await client.downloadDocument('uuid-1234')

      expect(result).toEqual(mockImageBuffer)
    })

    it('should convert non-Buffer body to Buffer', async () => {
      const mockData = 'mock image data'

      fakeDocumentManagementApi
        .get('/documents/uuid-1234/file')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, Buffer.from(mockData))

      const result = await client.downloadDocument('uuid-1234')

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result).toEqual(Buffer.from(mockData))
    })

    it('should handle download errors', async () => {
      fakeDocumentManagementApi
        .get('/documents/uuid-error/file')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(400, new Error('Download failed'))

      const result = await client.downloadDocument('uuid-error')

      expect(result).toBeNull()
    })

    it('should handle empty body', async () => {
      fakeDocumentManagementApi
        .get('/documents/uuid-empty/file')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      const result = await client.downloadDocument('uuid-empty')

      expect(result).toEqual(Buffer.from(''))
    })

    it('should download multiple documents', async () => {
      const mockBuffer1 = Buffer.from('image 1')
      const mockBuffer2 = Buffer.from('image 2')

      fakeDocumentManagementApi
        .get('/documents/uuid-1234/file')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockBuffer1)

      fakeDocumentManagementApi
        .get('/documents/uuid-5678/file')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockBuffer2)

      const result1 = await client.downloadDocument('uuid-1234')
      const result2 = await client.downloadDocument('uuid-5678')

      expect(result1).toEqual(mockBuffer1)
      expect(result2).toEqual(mockBuffer2)
    })
  })
})
