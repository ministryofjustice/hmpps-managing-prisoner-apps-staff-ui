const VALID_REJECTED_REASONS = [
  'Prisoner used the wrong app',
  'Prisoner has already sent this app',
  'Prisoner sent an abusive app',
]

// eslint-disable-next-line import/prefer-default-export
export const validateActionAndReply = (selectAction: string, actionReplyReason: string, rejectedReason?: string) => {
  const errors: Record<string, { text: string }> = {}

  if (!selectAction) {
    errors.selectAction = { text: 'Choose an action to close this application' }
  }

  if (selectAction === 'REJECTED' && !VALID_REJECTED_REASONS.includes(rejectedReason || '')) {
    errors.rejectedReason = { text: 'Choose the reason for this rejected application' }
  }

  if (actionReplyReason?.length > 1000) {
    errors.actionReplyReason = { text: 'Reason must be 1000 characters or less' }
  } else if (selectAction === 'DECLINED' && !actionReplyReason?.trim()) {
    errors.actionReplyReason = { text: 'Add a reason' }
  }

  return errors
}
