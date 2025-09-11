import { AddNewLegalPinPhoneContactDetails } from 'express-session'
import { validatePhoneNumber } from './validateTelephoneNumber'

const errorMessages = {
  phoneRequired: 'Enter the contact’s phone number',
  invalidFormat: 'Enter a phone number in the correct format',
  invalidNumber: 'You have entered an invalid number',
}

// eslint-disable-next-line import/prefer-default-export
export const validateAddNewLegalContact = (form: AddNewLegalPinPhoneContactDetails) => {
  const errors: Record<string, { text: string }> = {}

  if (!form.firstName || form.firstName.trim() === '') {
    errors.firstName = { text: 'Enter the contact’s first name' }
  }

  if (!form.lastName || form.lastName.trim() === '') {
    errors.lastName = { text: 'Enter the contact’s last name' }
  }

  if (!form.company || form.company.trim() === '') {
    errors.company = { text: 'Enter the contact’s company' }
  }

  if (!form.relationship || form.relationship === '') {
    errors.relationship = { text: 'Select a relationship' }
  }

  const telephone1 = form.telephone1?.trim() || ''
  if (!telephone1) {
    errors.telephone1 = { text: errorMessages.phoneRequired }
  } else {
    const result = validatePhoneNumber(telephone1)
    if (result === 'invalid_format') {
      errors.telephone1 = { text: errorMessages.invalidFormat }
    } else if (result === 'invalid_number') {
      errors.telephone1 = { text: errorMessages.invalidNumber }
    }
  }

  const telephone2 = form.telephone2?.trim() || ''
  if (telephone2) {
    const result = validatePhoneNumber(telephone2)
    if (result === 'invalid_format') {
      errors.telephone2 = { text: errorMessages.invalidFormat }
    } else if (result === 'invalid_number') {
      errors.telephone2 = { text: errorMessages.invalidNumber }
    }
  }

  return errors
}
