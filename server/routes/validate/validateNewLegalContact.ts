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

  function validateAndAssignError(fieldName: 'telephone1' | 'telephone2', isRequired: boolean) {
    const value = form[fieldName]?.trim() || ''
    if (isRequired && !value) {
      errors[fieldName] = { text: errorMessages.phoneRequired }
      return
    }

    if (value) {
      const result = validatePhoneNumber(value)
      if (result === 'invalid_format') {
        errors[fieldName] = { text: errorMessages.invalidFormat }
      } else if (result === 'invalid_number') {
        errors[fieldName] = { text: errorMessages.invalidNumber }
      }
    }
  }

  validateAndAssignError('telephone1', true)
  validateAndAssignError('telephone2', false)

  return errors
}
