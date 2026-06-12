import type { Request, Response } from 'express'
import checkActiveAgencyAccess from './checkActiveAgencyAccess'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import config from '../config'

describe('checkActiveAgencyAccess', () => {
  const req: Request = {} as jest.Mocked<Request>
  const next = jest.fn()

  const managingPrisonerAppsService = {
    getActiveAgencies: jest.fn(),
  } as unknown as jest.Mocked<ManagingPrisonerAppsService>

  function createRes(activeCaseLoadId?: string, includeUser = true): Response {
    return {
      locals: {
        ...(includeUser
          ? {
              user: {
                username: 'USER1',
                activeCaseLoadId,
              },
            }
          : {}),
      },
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as unknown as Response
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('allows access when active caseload matches active agencies', async () => {
    const res = createRes('CKI')
    managingPrisonerAppsService.getActiveAgencies.mockResolvedValue(['MDI', 'CKI'])

    const middleware = checkActiveAgencyAccess(managingPrisonerAppsService)
    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('allows access when active caseload is ***', async () => {
    const res = createRes('***')
    managingPrisonerAppsService.getActiveAgencies.mockResolvedValue(['MDI'])

    const middleware = checkActiveAgencyAccess(managingPrisonerAppsService)
    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('renders standard error page when active caseload does not match', async () => {
    const res = createRes('LEI')
    managingPrisonerAppsService.getActiveAgencies.mockResolvedValue(['MDI', 'CKI'])

    const middleware = checkActiveAgencyAccess(managingPrisonerAppsService)
    await middleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('pages/error', {
      message: 'Something went wrong. The error has been logged. Please try again',
      action: {
        text: 'Select a different service',
        href: config.apis.hmppsAuth.externalUrl,
      },
    })
  })

  it('renders standard error page when user is missing', async () => {
    const res = createRes(undefined, false)

    const middleware = checkActiveAgencyAccess(managingPrisonerAppsService)
    await middleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(managingPrisonerAppsService.getActiveAgencies).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('pages/error', {
      message: 'Something went wrong. The error has been logged. Please try again',
      action: {
        text: 'Select a different service',
        href: config.apis.hmppsAuth.externalUrl,
      },
    })
  })
})
