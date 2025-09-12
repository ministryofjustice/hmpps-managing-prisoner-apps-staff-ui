import { RemovePinPhoneContactDetails } from 'express-session'
import { validateAndAssignError } from './validateTelephoneNumber'

// eslint-disable-next-line import/prefer-default-export
export const validateRemovePinPhoneContact = (form: RemovePinPhoneContactDetails) => {
  const errors: Record<string, { text: string }> = {}

  if (!form.firstName || form.firstName.trim() === '') {
    errors.firstName = { text: 'Enter the contact’s first name' }
  }

  if (!form.lastName || form.lastName.trim() === '') {
    errors.lastName = { text: 'Enter the contact’s last name' }
  }

  validateAndAssignError({ form, errors, fieldName: 'telephone1', isRequired: true })
  validateAndAssignError({ form, errors, fieldName: 'telephone2', isRequired: false })

  return errors
}
