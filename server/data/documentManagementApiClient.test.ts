import superagent from 'superagent'
import DocumentManagementApiClient from './documentManagementApiClient'
import RestClient from './restClient'
import { mockDocument, mockDocuments } from '../testData'

jest.mock('./restClient')

jest.mock('superagent')

const MockedRestClient = jest.mocked(RestClient)
const mockedSuperagent = jest.mocked(superagent)

describe('DocumentManagementApiClient', () => {
  let client: DocumentManagementApiClient
  let mockRestClientInstance: jest.Mocked<RestClient>
  const token = 'test-token'

  beforeEach(() => {
    mockRestClientInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<RestClient>

    MockedRestClient.mockImplementation(() => mockRestClientInstance)

    client = new DocumentManagementApiClient(token)
    jest.clearAllMocks()
  })

  describe('uploadDocument', () => {
    it('should upload a single document successfully', async () => {
      const mockUploadRequest = {
        file: Buffer.from('test content'),
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        documentUuid: 'uuid-1234',
      }

      const mockPost = {
        attach: jest.fn().mockReturnThis(),
        field: jest.fn().mockReturnThis(),
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockResolvedValue({ body: mockDocument }),
      }

      ;(mockedSuperagent.post as jest.Mock) = jest.fn(() => mockPost)

      const result = await client.uploadDocument([mockUploadRequest])

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockDocument)
      expect(mockedSuperagent.post).toHaveBeenCalledWith(
        expect.stringContaining('/documents/PRISONER_APPLICATION/uuid-1234'),
      )
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

      const mockPost = {
        attach: jest.fn().mockReturnThis(),
        field: jest.fn().mockReturnThis(),
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        timeout: jest
          .fn()
          .mockResolvedValueOnce({ body: mockDocuments[0] })
          .mockResolvedValueOnce({ body: mockDocuments[1] }),
      }

      ;(mockedSuperagent.post as jest.Mock) = jest.fn(() => mockPost)

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

      const mockPost = {
        attach: jest.fn().mockReturnThis(),
        field: jest.fn().mockReturnThis(),
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockRejectedValue(new Error('Upload failed')),
      }

      ;(mockedSuperagent.post as jest.Mock) = jest.fn(() => mockPost)

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

      const mockPost = {
        attach: jest.fn().mockReturnThis(),
        field: jest.fn().mockReturnThis(),
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockResolvedValue({ body: mockDocument }),
      }

      ;(mockedSuperagent.post as jest.Mock) = jest.fn(() => mockPost)

      const result = await client.uploadDocument([mockUploadRequest])

      expect(result).toHaveLength(1)
      expect(mockedSuperagent.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/documents\/PRISONER_APPLICATION\/[a-f0-9-]{36}/),
      )
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

      const mockPost = {
        attach: jest.fn().mockReturnThis(),
        field: jest.fn().mockReturnThis(),
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockResolvedValueOnce({ body: mockDocuments[0] }).mockRejectedValueOnce(new Error('Failed')),
      }

      ;(mockedSuperagent.post as jest.Mock) = jest.fn(() => mockPost)

      const result = await client.uploadDocument(mockRequests)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockDocuments[0])
    })
  })

  describe('getDocument', () => {
    it('should retrieve a document by UUID successfully', async () => {
      mockRestClientInstance.get.mockResolvedValue(mockDocument)

      const result = await client.getDocument('uuid-1234')

      expect(result).toEqual(mockDocument)
      expect(mockRestClientInstance.get).toHaveBeenCalledWith({
        path: '/documents/uuid-1234',
        headers: {
          'Service-Name': 'hmpps-managing-prisoner-apps',
        },
      })
    })

    it('should handle errors when getting document fails', async () => {
      mockRestClientInstance.get.mockRejectedValue(new Error('Document not found'))

      const result = await client.getDocument('invalid-uuid')

      expect(result).toBeNull()
    })

    it('should handle 404 errors', async () => {
      const error = new Error('Not Found')
      Object.assign(error, { status: 404 })

      mockRestClientInstance.get.mockRejectedValue(error)

      const result = await client.getDocument('non-existent-uuid')

      expect(result).toBeNull()
    })

    it('should retrieve multiple documents', async () => {
      mockRestClientInstance.get.mockResolvedValueOnce(mockDocuments[0]).mockResolvedValueOnce(mockDocuments[1])

      const result1 = await client.getDocument('uuid-1')
      const result2 = await client.getDocument('uuid-2')

      expect(result1).toEqual(mockDocuments[0])
      expect(result2).toEqual(mockDocuments[1])
      expect(mockRestClientInstance.get).toHaveBeenCalledTimes(2)
    })
  })

  describe('downloadDocument', () => {
    it('should download a document successfully as Buffer', async () => {
      const mockImageBuffer = Buffer.from('mock image data')

      const mockGet = {
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        responseType: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockResolvedValue({ body: mockImageBuffer }),
      }

      ;(mockedSuperagent.get as jest.Mock) = jest.fn(() => mockGet)

      const result = await client.downloadDocument('uuid-1234')

      expect(result).toEqual(mockImageBuffer)
      expect(mockedSuperagent.get).toHaveBeenCalledWith(expect.stringContaining('/documents/uuid-1234/file'))
      expect(mockGet.responseType).toHaveBeenCalledWith('blob')
    })

    it('should convert non-Buffer body to Buffer', async () => {
      const mockData = 'mock image data'

      const mockGet = {
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        responseType: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockResolvedValue({ body: mockData }),
      }

      ;(mockedSuperagent.get as jest.Mock) = jest.fn(() => mockGet)

      const result = await client.downloadDocument('uuid-1234')

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result).toEqual(Buffer.from(mockData))
    })

    it('should handle download errors', async () => {
      const mockGet = {
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        responseType: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockRejectedValue(new Error('Download failed')),
      }

      ;(mockedSuperagent.get as jest.Mock) = jest.fn(() => mockGet)

      const result = await client.downloadDocument('uuid-error')

      expect(result).toBeNull()
    })

    it('should handle empty body', async () => {
      const mockGet = {
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        responseType: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockResolvedValue({ body: null }),
      }

      ;(mockedSuperagent.get as jest.Mock) = jest.fn(() => mockGet)

      const result = await client.downloadDocument('uuid-empty')

      expect(result).toBeNull()
    })

    it('should download multiple documents', async () => {
      const mockBuffer1 = Buffer.from('image 1')
      const mockBuffer2 = Buffer.from('image 2')

      const mockGet = {
        auth: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        responseType: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockResolvedValueOnce({ body: mockBuffer1 }).mockResolvedValueOnce({ body: mockBuffer2 }),
      }

      ;(mockedSuperagent.get as jest.Mock) = jest.fn(() => mockGet)

      const result1 = await client.downloadDocument('uuid-1234')
      const result2 = await client.downloadDocument('uuid-5678')

      expect(result1).toEqual(mockBuffer1)
      expect(result2).toEqual(mockBuffer2)
      expect(mockedSuperagent.get).toHaveBeenCalledTimes(2)
    })
  })
})
