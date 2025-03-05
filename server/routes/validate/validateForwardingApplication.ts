// eslint-disable-next-line import/prefer-default-export
export const validateForwardingApplication = (forwardToDepartment: string, forwardingReason: string) => {
  const errors: Record<string, { text: string }> = {}

  if (!forwardToDepartment) {
    errors.forwardToDepartment = { text: 'Choose where to send' }
  }

  if (forwardingReason && forwardingReason.length > 1000) {
    errors.forwardingReason = { text: 'Reason must be 1000 characters or less' }
  }

  return errors
}
