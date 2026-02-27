import { Document } from '../../@types/documentManagementApi'

export const mockDocument: Document = {
  documentUuid: '123e4567-e89b-12d3-a456-426614174000',
  documentType: 'PRISONER_APPLICATION',
  documentFilename: 'test-photo.jpg',
  filename: 'test-photo.jpg',
  fileExtension: 'jpg',
  fileSize: 1234,
  fileHash: 'abc123hash',
  mimeType: 'image/jpeg',
  metadata: {
    prisonerId: 'A1234BC',
    uploadedBy: 'TEST_USER',
    photoAdditionalDetails: 'Test photo details',
  },
  createdTime: '2024-01-01T12:00:00Z',
  createdByServiceName: 'hmpps-managing-prisoner-apps',
  createdByUsername: 'TEST_USER',
}

export const mockDocuments: Document[] = [
  {
    documentUuid: 'uuid-1',
    documentType: 'PRISONER_APPLICATION',
    documentFilename: 'photo1.jpg',
    filename: 'photo1.jpg',
    fileExtension: 'jpg',
    fileSize: 5000,
    fileHash: 'hash1',
    mimeType: 'image/jpeg',
    metadata: {
      prisonerId: 'A1234BC',
      uploadedBy: 'TEST_USER',
    },
    createdTime: '2024-01-01T12:00:00Z',
    createdByServiceName: 'hmpps-managing-prisoner-apps',
    createdByUsername: 'TEST_USER',
  },
  {
    documentUuid: 'uuid-2',
    documentType: 'PRISONER_APPLICATION',
    documentFilename: 'photo2.jpg',
    filename: 'photo2.jpg',
    fileExtension: 'jpg',
    fileSize: 6000,
    fileHash: 'hash2',
    mimeType: 'image/jpeg',
    metadata: {
      prisonerId: 'A1234BC',
      uploadedBy: 'TEST_USER',
    },
    createdTime: '2024-01-01T12:01:00Z',
    createdByServiceName: 'hmpps-managing-prisoner-apps',
    createdByUsername: 'TEST_USER',
  },
]

export const mockDocumentNotFound: Document = {
  documentUuid: 'non-existent-uuid',
  documentType: 'PRISONER_APPLICATION',
  documentFilename: 'not-found.jpg',
  filename: 'not-found.jpg',
  fileExtension: 'jpg',
  fileSize: 0,
  fileHash: '',
  mimeType: 'image/jpeg',
  metadata: {},
  createdTime: '2024-01-01T12:00:00Z',
  createdByServiceName: 'hmpps-managing-prisoner-apps',
  createdByUsername: 'TEST_USER',
}

export const mockUploadRequest = {
  file: Buffer.from('test file content'),
  filename: 'test-photo.jpg',
  mimeType: 'image/jpeg',
  documentUuid: '123e4567-e89b-12d3-a456-426614174000',
  metadata: {
    prisonerId: 'A1234BC',
    uploadedBy: 'TEST_USER',
    photoAdditionalDetails: 'Test photo details',
  },
}
