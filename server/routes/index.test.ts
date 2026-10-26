import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService from '../services/auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'

jest.mock('../services/auditService')

const auditService = new AuditService({} as HmppsAuditClient) as jest.Mocked<AuditService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(auditService.logAuditEvent).toHaveBeenCalledTimes(2)
        expect(auditService.logAuditEvent).toHaveBeenCalledWith({
          what: 'VIEW_APPLICATIONS_HOME_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details: {},
        })
        expect(auditService.logAuditEvent).toHaveBeenLastCalledWith(
          expect.objectContaining({ what: 'VIEW_APPLICATIONS_HOME_SUCCESS' }),
        )
      })
  })
})

describe('GET /accessibility-statement', () => {
  it('should render accessibility statement page', () => {
    return request(app)
      .get('/accessibility-statement')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Accessibility statement for Manage Applications')
        expect(auditService.logAuditEvent).toHaveBeenCalledTimes(2)
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ what: 'VIEW_ACCESSIBILITY_STATEMENT_ATTEMPT' }),
        )
        expect(auditService.logAuditEvent).toHaveBeenLastCalledWith(
          expect.objectContaining({ what: 'VIEW_ACCESSIBILITY_STATEMENT_SUCCESS' }),
        )
      })
  })
})

describe('application route auditing', () => {
  it('records rejected message actions as failures from the route', async () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)
    const managingPrisonerAppsService = {
      getPrisonerApp: jest.fn().mockResolvedValue({ status: 'APPROVED' }),
    } as unknown as ManagingPrisonerAppsService
    app = appWithAllRoutes({ services: { auditService, managingPrisonerAppsService }, userSupplier: () => user })

    await request(app).post('/applications/A1234BC/123/messages').send({ comment: 'Text' }).expect(302)

    expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ what: 'CREATE_APPLICATION_MESSAGE_ATTEMPT' }),
    )
    expect(auditService.logAuditEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        what: 'CREATE_APPLICATION_MESSAGE_FAILURE',
        details: expect.objectContaining({ failureReason: 'Application is closed' }),
      }),
    )
  })

  it('records a missing application redirect as a failed GET from the route', async () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)
    const managingPrisonerAppsService = {
      getPrisonerApp: jest.fn().mockResolvedValue(null),
    } as unknown as ManagingPrisonerAppsService
    app = appWithAllRoutes({ services: { auditService, managingPrisonerAppsService }, userSupplier: () => user })

    await request(app).get('/applications/A1234BC/123/print-reply').expect(302)

    expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ what: 'PRINT_APPLICATION_REPLY_ATTEMPT' }),
    )
    expect(auditService.logAuditEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({ what: 'PRINT_APPLICATION_REPLY_FAILURE' }),
    )
  })
})
