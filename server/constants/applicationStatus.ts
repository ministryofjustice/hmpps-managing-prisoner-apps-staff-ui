export const APPLICATION_STATUS = {
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING',
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
} as const

export const OPEN_STATUSES: string[] = [APPLICATION_STATUS.NEW, APPLICATION_STATUS.IN_PROGRESS]

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  [APPLICATION_STATUS.NEW]: 'New',
  [APPLICATION_STATUS.IN_PROGRESS]: 'In progress',
  [APPLICATION_STATUS.APPROVED]: 'Approved',
  [APPLICATION_STATUS.DECLINED]: 'Declined',
  [APPLICATION_STATUS.REJECTED]: 'Rejected',
}

export const APPLICATION_STATUS_TAG_COLOURS: Record<string, string> = {
  [APPLICATION_STATUS.NEW]: 'govuk-tag--blue',
  [APPLICATION_STATUS.IN_PROGRESS]: 'govuk-tag--light-blue',
  [APPLICATION_STATUS.APPROVED]: 'govuk-tag--green',
  [APPLICATION_STATUS.DECLINED]: 'govuk-tag--red',
  [APPLICATION_STATUS.REJECTED]: 'govuk-tag--purple',
}

export const isOpenStatus = (status?: string | null): boolean => !!status && OPEN_STATUSES.includes(status)

export const getStatusTag = (status?: string | null): { text: string; classes: string } => {
  const code = (status ?? '').toUpperCase()
  return {
    text: APPLICATION_STATUS_LABELS[code] ?? 'Closed',
    classes: APPLICATION_STATUS_TAG_COLOURS[code] ?? '',
  }
}
