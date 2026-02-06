import { auditService as auditClient } from '@ministryofjustice/hmpps-audit-client'
import config from '../config'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  ACTION_AND_REPLY_PAGE = 'ACTION_AND_REPLY_PAGE',
  APPLICATION_HISTORY_PAGE = 'APPLICATION_HISTORY_PAGE',
  APPLICATIONS_PAGE = 'APPLICATIONS_PAGE',
  CHANGE_APPLICATION_PAGE = 'CHANGE_APPLICATION_PAGE',
  COMMENTS_PAGE = 'COMMENTS_PAGE',
  CONFIRM_DETAILS_PAGE = 'CONFIRM_DETAILS_PAGE',
  FORWARD_APPLICATION_PAGE = 'FORWARD_APPLICATION_PAGE',
  LOG_APPLICATION_TYPE_PAGE = 'LOG_APPLICATION_TYPE_PAGE',
  LOG_DEPARTMENT_PAGE = 'LOG_DEPARTMENT_PAGE',
  LOG_DETAILS_PAGE = 'LOG_DETAILS_PAGE',
  LOG_GROUP_PAGE = 'LOG_GROUP_PAGE',
  LOG_PRISONER_DETAILS_PAGE = 'LOG_PRISONER_DETAILS_PAGE',
  LOG_METHOD_PAGE = 'LOG_METHOD_PAGE',
  LOG_PHOTO_CAPTURE_PAGE = 'LOG_PHOTO_CAPTURE_PAGE',
  LOG_CONFIRM_PHOTO_CAPTURE_PAGE = 'LOG_CONFIRM_PHOTO_CAPTURE_PAGE',
  LOG_ADD_ANOTHER_PHOTO_PAGE = 'LOG_ADD_ANOTHER_PHOTO_PAGE',
  LOG_ADDITIONAL_PHOTO_DETAILS_PAGE = 'LOG_ADDITIONAL_PHOTO_DETAILS_PAGE',
  SUBMIT_APPLICATION_PAGE = 'SUBMIT_APPLICATION_PAGE',
  SUBMIT_APPLICATION_CHANGE_PAGE = 'SUBMIT_APPLICATION_CHANGE_PAGE',
  UPDATE_APPLICATION_DETAILS_PAGE = 'UPDATE_APPLICATION_DETAILS_PAGE',
  VIEW_APPLICATION_PAGE = 'VIEW_APPLICATION_PAGE',
  VIEW_APPLICATIONS_PAGE = 'VIEW_APPLICATIONS_PAGE',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export interface AuditEvent {
  what: string
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export default class AuditService {
  async logAuditEvent(event: AuditEvent) {
    await auditClient.sendAuditMessage({
      action: event.what,
      who: event.who,
      subjectId: event.subjectId,
      subjectType: event.subjectType,
      correlationId: event.correlationId,
      service: config.sqs.audit.serviceName,
      details: JSON.stringify({
        ...event.details,
      }),
    })
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    await this.logAuditEvent({
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    })
  }
}
