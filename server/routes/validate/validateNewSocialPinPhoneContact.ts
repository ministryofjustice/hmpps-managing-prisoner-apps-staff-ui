import { validateAndAssignError } from './validateTelephoneNumber'

export type AddNewSocialPinPhoneContactForm = {
  earlyDaysCentre: string
  firstName: string
  lastName: string
  dateOfBirthOrAge: 'dateofbirth' | 'age' | 'donotknow'
  'dob-day'?: string
  'dob-month'?: string
  'dob-year'?: string
  age?: string
  relationship: string
  uprn?: string
  addressLine1?: string
  addressLine2?: string
  townOrCity?: string
  postcode?: string
  country?: string
  telephone1: string
  telephone2?: string
}

const isValidNumber = (value: string): boolean => /^\d+$/.test(value)
const isEmpty = (value?: string): boolean => !value || value.trim() === ''

export const validateAddNewSocialContact = (form: AddNewSocialPinPhoneContactForm, isUpdate: boolean) => {
  const errors: Record<string, { text: string }> = {}

  if (!form.earlyDaysCentre && !isUpdate) {
    errors.earlyDaysCentre = { text: 'Select yes if this person is in the first night or early days centre' }
  }

  if (isEmpty(form.firstName)) {
    errors.firstName = { text: 'Enter the contact’s first name' }
  }

  if (isEmpty(form.lastName)) {
    errors.lastName = { text: 'Enter the contact’s last name' }
  }

  if (!form.dateOfBirthOrAge) {
    errors.dateOfBirthOrAge = { text: 'Select an answer about the contact’s date of birth' }
  } else if (form.dateOfBirthOrAge === 'dateofbirth') {
    const day = form['dob-day']?.trim()
    const month = form['dob-month']?.trim()
    const year = form['dob-year']?.trim()

    const isDayMissing = !day
    const isMonthMissing = !month
    const isYearMissing = !year

    if (isDayMissing && isMonthMissing && isYearMissing) {
      const dobErrorMessage = 'Enter the contact’s date of birth'
      errors.dob = { text: dobErrorMessage }
      errors['dob-day'] = { text: dobErrorMessage }
      errors['dob-month'] = { text: dobErrorMessage }
      errors['dob-year'] = { text: dobErrorMessage }
    } else {
      const isDayInValid = !day || !isValidNumber(day)
      const isMonthInValid = !month || !isValidNumber(month)
      const isYearInValid = !year || !isValidNumber(year)

      if (isDayInValid || isMonthInValid || isYearInValid) {
        const dobErrorMessage = 'Date must include a day, a month and a year'
        errors.dob = { text: dobErrorMessage }
        if (isDayInValid) errors['dob-day'] = { text: dobErrorMessage }
        if (isMonthInValid) errors['dob-month'] = { text: dobErrorMessage }
        if (isYearInValid) errors['dob-year'] = { text: dobErrorMessage }
      } else {
        const enteredDate = new Date(`${year}-${month}-${day}`)
        const today = new Date()
        if (enteredDate > today) {
          const dobErrorMessage = 'Date must be in the past'
          errors.dob = { text: dobErrorMessage }
          errors['dob-day'] = { text: dobErrorMessage }
          errors['dob-month'] = { text: dobErrorMessage }
          errors['dob-year'] = { text: dobErrorMessage }
        }
      }
    }
  } else if (form.dateOfBirthOrAge === 'age') {
    if (isEmpty(form.age) || !isValidNumber(form.age.trim())) {
      errors.age = { text: 'Enter the contact’s age' }
    }
  }

  if (isEmpty(form.relationship)) {
    errors.relationship = { text: 'Select a relationship' }
  }

  validateAndAssignError({ form, errors, fieldName: 'telephone1', isRequired: true })
  validateAndAssignError({ form, errors, fieldName: 'telephone2', isRequired: false })

  return errors
}
