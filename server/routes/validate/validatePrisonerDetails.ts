import { isValid, parse } from 'date-fns'

const isValidPrisonNumber = (prisonNumber: string): boolean => {
  const prisonNumberRegex = /^[AC-HJ-NP-RTV-Z]\d{4}[AC-HJ-NP-RTV-Z]{2}$/
  return prisonNumberRegex.test(prisonNumber)
}

const isValidDate = (dateString: string): boolean => {
  const parsedDate = parse(dateString, 'd/M/yyyy', new Date())
  return isValid(parsedDate)
}

const validatePrisonerDetails = (prisonNumber: string, dateString: string) => {
  const errors: Record<string, { text: string }> = {}

  if (!prisonNumber || !isValidPrisonNumber(prisonNumber)) {
    errors.prisonNumber = { text: 'Enter a valid prison number' }
  }

  if (!dateString || !isValidDate(dateString)) {
    errors.dateString = { text: 'Enter or select a valid date' }
  }

  return errors
}

export default validatePrisonerDetails
