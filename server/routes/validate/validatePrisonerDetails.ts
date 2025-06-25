import { isValid, parse } from 'date-fns'
import { APPLICATION_TYPE_VALUES, ApplicationType } from '../../constants/applicationTypes'

const isValidPrisonNumber = (prisonNumber: string): boolean => {
  const prisonNumberRegex = /^[A-Z]\d{4}[A-Z]{2}$/
  return prisonNumberRegex.test(prisonNumber)
}

const isValidDate = (dateString: string): boolean => {
  const parsedDate = parse(dateString, 'd/M/yyyy', new Date())
  return isValid(parsedDate)
}

const validatePrisonerDetails = (
  applicationType: ApplicationType,
  prisonNumber: string,
  dateString: string,
  earlyDaysCentre: boolean,
) => {
  const errors: Record<string, { text: string }> = {}

  if (!prisonNumber || !isValidPrisonNumber(prisonNumber)) {
    errors.prisonNumber = { text: 'Enter a valid prison number' }
  }

  if (!dateString || !isValidDate(dateString)) {
    errors.dateString = { text: 'Enter or select a valid date' }
  }

  if (!earlyDaysCentre && applicationType.value === APPLICATION_TYPE_VALUES.PIN_PHONE_ADD_NEW_CONTACT) {
    errors.earlyDaysCentre = { text: 'Select if this person is in the first night or early days centre' }
  }

  return errors
}

export default validatePrisonerDetails
