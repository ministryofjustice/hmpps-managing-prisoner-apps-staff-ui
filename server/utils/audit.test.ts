import { Request } from 'express'
import { auditLoggersFor, doWithAuditLogging } from './audit'
import AuditService from '../services/auditService'

jest.mock('../services/auditService')

describe('auditLoggersFor', () => {
  const mockAuditService = new AuditService(null) as jest.Mocked<AuditService>
  const req = { id: 'XXX-YYY-ZZZ', user: { username: 'TESTER' } } as Request
  const auditSetupDetails = {
    auditPrefix: 'VIEW_TEST_RESULTS',
    auditService: mockAuditService as unknown as AuditService,
    req,
    coreAuditEvent: {
      subjectId: 'SOME_NOMIS_ID',
      subjectType: 'PRISONER_ID',
      details: {
        some: 'details',
      },
    },
  }

  afterEach(() => jest.resetAllMocks())

  it('returns a audit event logger that will log _ATTEMPT events with the auditService', async () => {
    const { logAttempt } = auditLoggersFor(auditSetupDetails)

    await logAttempt({ extraDetails: { more: 'details' } })

    expect(mockAuditService.logAuditEvent).toHaveBeenCalledWith({
      who: 'TESTER',
      what: 'VIEW_TEST_RESULTS_ATTEMPT',
      correlationId: 'XXX-YYY-ZZZ',
      subjectId: 'SOME_NOMIS_ID',
      subjectType: 'PRISONER_ID',
      details: {
        some: 'details',
        more: 'details',
      },
    })
  })

  it('returns a audit event logger that will log _SUCCESS events with the auditService', async () => {
    const { logSuccess } = auditLoggersFor(auditSetupDetails)

    await logSuccess({ extraDetails: { more: 'details' } })

    expect(mockAuditService.logAuditEvent).toHaveBeenCalledWith({
      who: 'TESTER',
      what: 'VIEW_TEST_RESULTS_SUCCESS',
      correlationId: 'XXX-YYY-ZZZ',
      subjectId: 'SOME_NOMIS_ID',
      subjectType: 'PRISONER_ID',
      details: {
        some: 'details',
        more: 'details',
      },
    })
  })

  it('returns a audit event logger that will log _FAILURE events with the auditService', async () => {
    const { logFailure } = auditLoggersFor(auditSetupDetails)

    const error = new Error('Something went really wrong')

    await logFailure({ extraDetails: { more: 'details' }, error })

    expect(mockAuditService.logAuditEvent).toHaveBeenCalledWith({
      who: 'TESTER',
      what: 'VIEW_TEST_RESULTS_FAILURE',
      correlationId: 'XXX-YYY-ZZZ',
      subjectId: 'SOME_NOMIS_ID',
      subjectType: 'PRISONER_ID',
      details: {
        some: 'details',
        more: 'details',
        failureReason: 'Something went really wrong',
      },
    })
  })
})

describe('doWithAuditLogging', () => {
  const mockAuditService = new AuditService(null) as jest.Mocked<AuditService>
  const req = { id: 'XXX-YYY-ZZZ', user: { username: 'TESTER' } } as Request
  const auditSetupDetails = {
    auditPrefix: 'VIEW_TEST_RESULTS',
    auditService: mockAuditService as unknown as AuditService,
    req,
    coreAuditEvent: {
      subjectId: 'SOME_NOMIS_ID',
      subjectType: 'PRISONER_ID',
      details: {
        some: 'details',
      },
    },
  }

  afterEach(() => jest.resetAllMocks())

  describe('when the code being run has no errors raised', () => {
    it('will log an _ATTEMPT audit event first then a _SUCCESS afterwards', async () => {
      await doWithAuditLogging(auditSetupDetails, async () => {
        // noop
      })

      expect(mockAuditService.logAuditEvent).toHaveBeenCalledWith({
        who: 'TESTER',
        what: 'VIEW_TEST_RESULTS_ATTEMPT',
        correlationId: 'XXX-YYY-ZZZ',
        subjectId: 'SOME_NOMIS_ID',
        subjectType: 'PRISONER_ID',
        details: {
          some: 'details',
        },
      })

      expect(mockAuditService.logAuditEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          what: 'VIEW_TEST_RESULTS_FAILURE',
        }),
      )

      expect(mockAuditService.logAuditEvent).toHaveBeenCalledWith({
        who: 'TESTER',
        what: 'VIEW_TEST_RESULTS_SUCCESS',
        correlationId: 'XXX-YYY-ZZZ',
        subjectId: 'SOME_NOMIS_ID',
        subjectType: 'PRISONER_ID',
        details: {
          some: 'details',
        },
      })
    })
  })

  describe('when the code being run raises an error', () => {
    it('will log an _ATTEMPT audit event first then a _FAILURE afterwards and rethrow the error', async () => {
      try {
        await doWithAuditLogging(auditSetupDetails, async () => {
          throw new Error('Something went completely wrong')
        })
      } catch (e) {
        expect(e.message).toEqual('Something went completely wrong')
      }

      expect(mockAuditService.logAuditEvent).toHaveBeenCalledWith({
        who: 'TESTER',
        what: 'VIEW_TEST_RESULTS_ATTEMPT',
        correlationId: 'XXX-YYY-ZZZ',
        subjectId: 'SOME_NOMIS_ID',
        subjectType: 'PRISONER_ID',
        details: {
          some: 'details',
        },
      })

      expect(mockAuditService.logAuditEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          what: 'VIEW_TEST_RESULTS_SUCCESS',
        }),
      )

      expect(mockAuditService.logAuditEvent).toHaveBeenCalledWith({
        who: 'TESTER',
        what: 'VIEW_TEST_RESULTS_FAILURE',
        correlationId: 'XXX-YYY-ZZZ',
        subjectId: 'SOME_NOMIS_ID',
        subjectType: 'PRISONER_ID',
        details: {
          some: 'details',
          failureReason: 'Something went completely wrong',
        },
      })
    })
  })
})
