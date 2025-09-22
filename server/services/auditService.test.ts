import { auditService as auditClient } from '@ministryofjustice/hmpps-audit-client'
import AuditService, { Page } from './auditService'

const clientSpy = jest.spyOn(auditClient, 'sendAuditMessage')

describe('Audit service', () => {
  let auditService: AuditService

  beforeEach(() => {
    clientSpy.mockResolvedValue()
    auditService = new AuditService()
  })

  describe('logAuditEvent', () => {
    it('sends audit message using audit client', async () => {
      await auditService.logAuditEvent({
        what: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(clientSpy).toHaveBeenCalledWith({
        action: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        service: 'hmpps-managing-prisoner-apps',
        details: JSON.stringify({ extraDetails: 'example' }),
      })
    })
  })

  describe('logPageView', () => {
    it('sends page view event audit message using audit client', async () => {
      await auditService.logPageView(Page.EXAMPLE_PAGE, {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(clientSpy).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        service: 'hmpps-managing-prisoner-apps',
        details: JSON.stringify({ extraDetails: 'example' }),
      })
    })
  })
})
