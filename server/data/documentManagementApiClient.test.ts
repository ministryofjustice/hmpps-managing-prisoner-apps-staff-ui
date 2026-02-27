import nock from 'nock'
import config from '../config'
import DocumentManagementApiClient from './documentManagementApiClient'
import { mockDocument, mockDocuments, mockDocumentNotFound, mockUploadRequest } from '../testData'

describe('DocumentManagementApiClient', () => {
  let fakeDocumentApi: nock.Scope
  let documentManagementApiClient: DocumentManagementApiClient
  const token = 'test-token'

  beforeEach(() => {
    fakeDocumentApi = nock(config.apis.documentApi.url)
    documentManagementApiClient = new DocumentManagementApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('uploadDocument', () => {
    it('should upload a single document successfully', async () => {
      fakeDocumentApi
        .post(`/documents/PRISONER_APPLICATION/${mockDocument.documentUuid}`)
        .matchHeader('Service-Name', 'hmpps-managing-prisoner-apps')
        .reply(201, mockDocument)

      const result = await documentManagementApiClient.uploadDocument([mockUploadRequest])

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockDocument)
    })

    it('should upload multiple documents successfully', async () => {
      const requests = mockDocuments.map(doc => ({
        file: Buffer.from(`file-${doc.documentUuid}`),
        filename: doc.filename,
        mimeType: doc.mimeType,
        documentUuid: doc.documentUuid,
      }))

      fakeDocumentApi
        .post(`/documents/PRISONER_APPLICATION/${mockDocuments[0].documentUuid}`)
        .reply(201, mockDocuments[0])

      fakeDocumentApi
        .post(`/documents/PRISONER_APPLICATION/${mockDocuments[1].documentUuid}`)
        .reply(201, mockDocuments[1])

      const result = await documentManagementApiClient.uploadDocument(requests)

      expect(result).toHaveLength(2)
      expect(result).toEqual(mockDocuments)
    })

    it('should handle upload errors gracefully', async () => {
      const uploadRequest = {
        file: Buffer.from('test'),
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        documentUuid: 'error-uuid',
      }

      fakeDocumentApi
        .post('/documents/PRISONER_APPLICATION/error-uuid')
        .reply(500, { message: 'Internal server error' })

      const result = await documentManagementApiClient.uploadDocument([uploadRequest])

      expect(result).toEqual([])
    })
  })

  describe('getDocument', () => {
    it('should fetch document metadata successfully', async () => {
      fakeDocumentApi
        .get(`/documents/${mockDocument.documentUuid}`)
        .matchHeader('Service-Name', 'hmpps-managing-prisoner-apps')
        .reply(200, mockDocument)

      const result = await documentManagementApiClient.getDocument(mockDocument.documentUuid)

      expect(result).toEqual(mockDocument)
    })

    it('should return null when document not found', async () => {
      fakeDocumentApi
        .get(`/documents/${mockDocumentNotFound.documentUuid}`)
        .reply(404, { message: 'Document not found' })

      const result = await documentManagementApiClient.getDocument(mockDocumentNotFound.documentUuid)

      expect(result).toBeNull()
    })
  })

  describe('downloadDocument', () => {
    it('should download document file successfully', async () => {
      const fileContent = Buffer.from('test file content')

      fakeDocumentApi
        .get(`/documents/${mockDocument.documentUuid}/file`)
        .matchHeader('Service-Name', 'hmpps-managing-prisoner-apps')
        .reply(200, fileContent, {
          'Content-Type': 'image/jpeg',
          'Content-Length': fileContent.length.toString(),
        })

      const result = await documentManagementApiClient.downloadDocument(mockDocument.documentUuid)

      expect(result).toBeInstanceOf(Buffer)
      expect(result?.toString()).toBe('test file content')
    })

    it('should return null when file not found', async () => {
      fakeDocumentApi
        .get(`/documents/${mockDocumentNotFound.documentUuid}/file`)
        .reply(404, { message: 'File not found' })

      const result = await documentManagementApiClient.downloadDocument(mockDocumentNotFound.documentUuid)

      expect(result).toBeNull()
    })

    it('should return null on download error', async () => {
      const documentUuid = 'error-uuid'

      fakeDocumentApi.get(`/documents/${documentUuid}/file`).reply(500, { message: 'Internal server error' })

      const result = await documentManagementApiClient.downloadDocument(documentUuid)

      expect(result).toBeNull()
    })
  })
})
