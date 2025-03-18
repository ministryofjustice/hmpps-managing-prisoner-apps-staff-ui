import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  ACTION_AND_REPLY_PAGE = 'ACTION_AND_REPLY_PAGE',
  APPLICATIONS_PAGE = 'APPLICATIONS_PAGE',
  CHANGE_APPLICATION_PAGE = 'CHANGE_APPLICATION_PAGE',
  CONFIRM_DETAILS_PAGE = 'CONFIRM_DETAILS_PAGE',
  FORWARD_APPLICATION_PAGE = 'FORWARD_APPLICATION_PAGE',
  APPLICATION_HISTORY_PAGE = 'APPLICATION_HISTORY_PAGE',
  LOG_APPLICATION_TYPE_PAGE = 'LOG_APPLICATION_TYPE_PAGE',
  LOG_PRISONER_DETAILS_PAGE = 'LOG_PRISONER_DETAILS_PAGE',
  LOG_DETAILS_PAGE = 'LOG_DETAILS_PAGE',
  SUBMIT_APPLICATION_PAGE = 'SUBMIT_APPLICATION_PAGE',
  UPDATE_APPLICATION_DETAILS_PAGE = 'UPDATE_APPLICATION_DETAILS_PAGE',
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
