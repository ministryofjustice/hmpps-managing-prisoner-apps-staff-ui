// eslint-disable-next-line import/prefer-default-export
export const validateActionAndReply = (selectAction: string, actionReplyReason: string) => {
  const errors: Record<string, { text: string }> = {}

  if (!selectAction) {
    errors.selectAction = { text: 'Select an action' }
  }

  if (actionReplyReason?.length > 1000) {
    errors.actionReplyReason = { text: 'Reason must be 1000 characters or less' }
  } else if (selectAction === 'declined' && !actionReplyReason?.trim()) {
    errors.actionReplyReason = { text: 'Add a reason' }
  }

  return errors
}
