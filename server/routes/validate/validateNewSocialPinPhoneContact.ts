import { isValidPhoneNumber } from './validateTelephoneNumber'

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
  telephone1: string
  telephone2?: string
}

const isValidNumber = (value: string) => /^\d+$/.test(value)

export const validateAddNewSocialContact = (form: AddNewSocialPinPhoneContactForm, isUpdate: boolean) => {
  const errors: Record<string, { text: string }> = {}

  if (!form.earlyDaysCentre && !isUpdate) {
    errors.earlyDaysCentre = { text: 'Select yes if this person is in the first night or early days centre' }
  }

  if (!form.firstName || form.firstName.trim() === '') {
    errors.firstName = { text: 'Enter the contact’s first name' }
  }

  if (!form.lastName || form.lastName.trim() === '') {
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
    if (!form.age || form.age.trim() === '' || !isValidNumber(form.age.trim())) {
      errors.age = { text: 'Enter the contact’s age' }
    }
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
