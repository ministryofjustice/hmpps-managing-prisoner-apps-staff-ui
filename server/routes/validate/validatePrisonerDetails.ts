// eslint-disable-next-line import/prefer-default-export
export const validatePrisonerDetails = (prisonNumber: string, dateString: string) => {
  const errors: Record<string, { text: string }> = {}

  if (!prisonNumber) errors.prisonNumber = { text: 'Enter a valid prison number' }

  if (!dateString) errors.dateString = { text: 'Enter or select a valid date' }

  return errors
}
