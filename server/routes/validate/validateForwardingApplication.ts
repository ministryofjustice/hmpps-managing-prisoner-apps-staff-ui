// eslint-disable-next-line import/prefer-default-export
export const validateForwardingApplication = (forwardTo: string, forwardingReason: string) => {
  const errors: Record<string, { text: string }> = {}

  if (!forwardTo) {
    errors.forwardTo = { text: 'Choose where to send' }
  }

  if (forwardingReason && forwardingReason.length > 1000) {
    errors.forwardingReason = { text: 'Reason must be 1000 characters or less' }
  }

  return errors
}
