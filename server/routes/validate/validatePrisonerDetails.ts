const isValidPrisonNumber = (prisonNumber: string): boolean => {
  const prisonNumberRegex = /^[A-Z]\d{4}[A-Z]{2}$/
  return prisonNumberRegex.test(prisonNumber)
}

const validatePrisonerDetails = (prisonNumber: string) => {
  const errors: Record<string, { text: string }> = {}

  if (!prisonNumber || !isValidPrisonNumber(prisonNumber)) {
    errors.prisonNumber = { text: 'Enter a valid prison number' }
  }

  return errors
}

export default validatePrisonerDetails
