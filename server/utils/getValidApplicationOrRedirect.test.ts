import { Request, Response } from 'express'
import { getAppType } from '../helpers/application/getAppType'
import AuditService, { Page } from '../services/auditService'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { app, appTypes } from '../testData'
import getValidApplicationOrRedirect from './getValidApplicationOrRedirect'
import { Document } from '../@types/documentManagementApi'
import DocumentManagementService from '../services/documentManagementService'

jest.mock('../helpers/application/getAppType', () => ({
  getAppType: jest.fn(),
}))

const mockedGetAppType = jest.mocked(getAppType)

describe(getValidApplicationOrRedirect.name, () => {
  let managingPrisonerAppsService: ManagingPrisonerAppsService
  let documentManagementService: DocumentManagementService
  let auditService: AuditService
  let req: Request
  let res: Response

  const mockDocument: Document = {
    documentUuid: 'doc-uuid-1',
    documentType: 'PRISONER_APPLICATION',
    documentFilename: 'application-photo[photo1].jpg',
    filename: 'application-photo[photo1]',
    fileExtension: 'jpg',
    fileSize: 248026,
    fileHash: '',
    mimeType: 'image/jpeg',
    metadata: {
      uploadedBy: 'TEST_USER',
    },
    createdTime: '2026-02-26T15:32:11',
    createdByServiceName: 'hmpps-managing-prisoner-apps',
    createdByUsername: null,
  }

  beforeEach(() => {
    jest.resetAllMocks()

    managingPrisonerAppsService = {
      getPrisonerApp: jest.fn(),
    } as unknown as ManagingPrisonerAppsService

    auditService = {
      logPageView: jest.fn(),
    } as unknown as AuditService

    documentManagementService = {
      getDocument: jest.fn(),
    } as unknown as DocumentManagementService

    req = {
      params: { prisonerId: 'P123', applicationId: 'A456' },
      id: 'corr-abc',
    } as Partial<Request> as Request

    res = {
      locals: {
        user: { username: 'emma' },
      },
      redirect: jest.fn(),
    } as unknown as Partial<Response> as Response

    mockedGetAppType.mockResolvedValue(Object.values(appTypes)[0])
  })

  it('redirects to /applications and returns null when application is not found', async () => {
    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(null)

    const result = await getValidApplicationOrRedirect(req, res, auditService, managingPrisonerAppsService)

    expect(managingPrisonerAppsService.getPrisonerApp).toHaveBeenCalledWith('P123', 'A456', res.locals.user)
    expect(res.redirect).toHaveBeenCalledWith('/applications')
    expect(mockedGetAppType).not.toHaveBeenCalled()
    expect(auditService.logPageView).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('throws when applicationType is unknown (getAppType returns null/undefined)', async () => {
    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(app)
    mockedGetAppType.mockResolvedValue(null)

    await expect(getValidApplicationOrRedirect(req, res, auditService, managingPrisonerAppsService)).rejects.toThrow(
      'Unknown application type',
    )

    expect(managingPrisonerAppsService.getPrisonerApp).toHaveBeenCalledWith('P123', 'A456', res.locals.user)
    expect(mockedGetAppType).toHaveBeenCalledWith(managingPrisonerAppsService, res.locals.user, '3')
    expect(auditService.logPageView).not.toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('returns application and applicationType, and does not audit when auditPage is not provided', async () => {
    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(app)

    const result = await getValidApplicationOrRedirect(req, res, auditService, managingPrisonerAppsService)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(mockedGetAppType).toHaveBeenCalledWith(managingPrisonerAppsService, res.locals.user, '3')
    expect(auditService.logPageView).not.toHaveBeenCalled()

    expect(result).toEqual({ application: app, applicationType: Object.values(appTypes)[0], documents: [] })
  })

  it('audits page view when auditPage is provided (with who + correlationId)', async () => {
    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(app)

    const result = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      Page.EXAMPLE_PAGE,
    )

    expect(auditService.logPageView).toHaveBeenCalledTimes(1)
    expect(auditService.logPageView).toHaveBeenCalledWith(Page.EXAMPLE_PAGE, {
      who: 'emma',
      correlationId: 'corr-abc',
    })

    expect(result).toEqual({ application: app, applicationType: Object.values(appTypes)[0], documents: [] })
  })

  it('fetches documents when application has files and documentManagementService is provided', async () => {
    const appWithFiles = {
      ...app,
      files: [
        {
          id: '1',
          documentId: 'doc-uuid-1',
          fileName: 'photo1.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:11',
          createdBy: 'TEST_USER',
        },
      ],
    }

    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(appWithFiles)
    documentManagementService.getDocument = jest.fn().mockResolvedValue(mockDocument)

    const result = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      undefined,
      documentManagementService,
    )

    expect(documentManagementService.getDocument).toHaveBeenCalledWith('doc-uuid-1', 'emma')
    expect(result).toEqual({
      application: appWithFiles,
      applicationType: Object.values(appTypes)[0],
      documents: [mockDocument],
    })
  })

  it('returns empty documents array when application has no files', async () => {
    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(app)

    const result = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      undefined,
      documentManagementService,
    )

    expect(documentManagementService.getDocument).not.toHaveBeenCalled()
    expect(result).toEqual({
      application: app,
      applicationType: Object.values(appTypes)[0],
      documents: [],
    })
  })

  it('returns empty documents array when documentManagementService is not provided', async () => {
    const appWithFiles = {
      ...app,
      files: [
        {
          id: '1',
          documentId: 'doc-uuid-1',
          fileName: 'photo1.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:11',
          createdBy: 'TEST_USER',
        },
      ],
    }

    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(appWithFiles)

    const result = await getValidApplicationOrRedirect(req, res, auditService, managingPrisonerAppsService, undefined)

    expect(result).toEqual({
      application: appWithFiles,
      applicationType: Object.values(appTypes)[0],
      documents: [],
    })
  })

  it('handles document fetch failure gracefully', async () => {
    const appWithFiles = {
      ...app,
      files: [
        {
          id: '1',
          documentId: 'doc-uuid-1',
          fileName: 'photo1.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:11',
          createdBy: 'TEST_USER',
        },
      ],
    }

    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(appWithFiles)
    documentManagementService.getDocument = jest.fn().mockRejectedValue(new Error('API Error'))

    const result = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      undefined,
      documentManagementService,
    )

    expect(result?.documents).toEqual([])
  })

  it('fetches multiple documents successfully', async () => {
    const mockDocument2 = { ...mockDocument, documentUuid: 'doc-uuid-2', documentFilename: 'photo2.jpg' }
    const appWithFiles = {
      ...app,
      files: [
        {
          id: '1',
          documentId: 'doc-uuid-1',
          fileName: 'photo1.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:11',
          createdBy: 'TEST_USER',
        },
        {
          id: '2',
          documentId: 'doc-uuid-2',
          fileName: 'photo2.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:12',
          createdBy: 'TEST_USER',
        },
      ],
    }

    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(appWithFiles)
    documentManagementService.getDocument = jest
      .fn()
      .mockResolvedValueOnce(mockDocument)
      .mockResolvedValueOnce(mockDocument2)

    const result = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      undefined,
      documentManagementService,
    )

    expect(documentManagementService.getDocument).toHaveBeenCalledTimes(2)
    expect(result?.documents).toHaveLength(2)
  })

  it('returns successful documents when some fetches fail', async () => {
    const appWithFiles = {
      ...app,
      files: [
        {
          id: '1',
          documentId: 'doc-uuid-1',
          fileName: 'photo1.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:11',
          createdBy: 'TEST_USER',
        },
        {
          id: '2',
          documentId: 'doc-uuid-2',
          fileName: 'photo2.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:12',
          createdBy: 'TEST_USER',
        },
      ],
    }

    managingPrisonerAppsService.getPrisonerApp = jest.fn().mockResolvedValue(appWithFiles)
    documentManagementService.getDocument = jest
      .fn()
      .mockResolvedValueOnce(mockDocument)
      .mockRejectedValueOnce(new Error('Not found'))

    const result = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      undefined,
      documentManagementService,
    )

    expect(result?.documents).toEqual([mockDocument])
  })
})
