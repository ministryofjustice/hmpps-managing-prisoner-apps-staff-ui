import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { mockDocument, mockDocuments } from '../../server/testData/documents/document'

export default {
  stubGetDocument: ({ documentUuid }: { documentUuid: string }): SuperAgentRequest => {
    const document = mockDocuments.find(doc => doc.documentUuid === documentUuid) || {
      ...mockDocument,
      documentUuid,
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/documentApi/documents/${documentUuid}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: document,
      },
    })
  },

  stubDownloadDocument: ({ documentUuid }: { documentUuid: string }): SuperAgentRequest => {
    // Mock a 1x1 transparent PNG image (base64)
    const mockImageBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/documentApi/documents/${documentUuid}/file`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `inline; filename="test-photo.jpg"`,
        },
        base64Body: mockImageBase64,
      },
    })
  },

  stubGetDocuments: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/documentApi/documents.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockDocuments,
      },
    })
  },
}
