import { APPLICATION_STATUS } from '../constants/applicationStatus'

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS]

export const getStatusesForQuery = (statusQuery?: string): ApplicationStatus[] => {
  if (statusQuery?.toUpperCase() === 'CLOSED') {
    return [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DECLINED]
  }

  return [APPLICATION_STATUS.PENDING]
}
