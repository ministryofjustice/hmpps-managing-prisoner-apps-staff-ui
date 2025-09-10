import { AddNewLegalPinPhoneContactDetails } from 'express-session'
import { isValidPhoneNumber } from './validateTelephoneNumber'

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

  if (!form.telephone1 || form.telephone1.trim() === '') {
    errors.telephone1 = { text: 'Enter the contact’s phone number' }
  } else if (!isValidPhoneNumber(form.telephone1.trim())) {
    errors.telephone1 = { text: 'Enter a phone number in the correct format' }
  }

  if (form.telephone2 && form.telephone2.trim() !== '' && !isValidPhoneNumber(form.telephone2.trim())) {
    errors.telephone2 = { text: 'Enter a phone number in the correct format' }
  }

  return errors
}
