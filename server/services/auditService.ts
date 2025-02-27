import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  APPLICATIONS_PAGE = 'APPLICATIONS_PAGE',
  CONFIRM_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE = 'CONFIRM_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE',
  FORWARD_APPLICATION_PAGE = 'FORWARD_APPLICATION_PAGE',
  LOG_APPLICATION_TYPE_PAGE = 'LOG_APPLICATION_TYPE_PAGE',
  LOG_PRISONER_DETAILS_PAGE = 'LOG_PRISONER_DETAILS_PAGE',
  LOG_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE = 'LOG_SWAP_VOS_PIN_CREDIT_DETAILS_PAGE',
  SUBMIT_APPLICATION_PAGE = 'SUBMIT_APPLICATION_PAGE',
  VIEW_APPLICATION_PAGE = 'VIEW_APPLICATION_PAGE',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
