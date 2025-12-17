import { Request, Response } from 'express'
import { getAppType } from '../helpers/application/getAppType'
import AuditService, { Page } from '../services/auditService'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { app, appTypes } from '../testData'
import getValidApplicationOrRedirect from './getValidApplicationOrRedirect'

jest.mock('../helpers/application/getAppType', () => ({
  getAppType: jest.fn(),
}))

const mockedGetAppType = jest.mocked(getAppType)

describe(getValidApplicationOrRedirect.name, () => {
  let managingPrisonerAppsService: ManagingPrisonerAppsService
  let auditService: AuditService
  let req: Request
  let res: Response

  beforeEach(() => {
    jest.resetAllMocks()

    managingPrisonerAppsService = {
      getPrisonerApp: jest.fn(),
    } as unknown as ManagingPrisonerAppsService

    auditService = {
      logPageView: jest.fn(),
    } as unknown as AuditService

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

    expect(result).toEqual({ application: app, applicationType: Object.values(appTypes)[0] })
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

    expect(result).toEqual({ application: app, applicationType: Object.values(appTypes)[0] })
  })
})
