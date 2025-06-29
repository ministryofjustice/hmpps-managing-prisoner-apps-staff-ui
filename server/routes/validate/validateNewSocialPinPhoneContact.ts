export type AddNewSocialPinPhoneContactForm = {
  firstName: string
  lastName: string
  dateOfBirthOrAge: 'dateofbirth' | 'age' | 'donotknow'
  'dob-day'?: string
  'dob-month'?: string
  'dob-year'?: string
  age?: string
  relationship: string
  telephone1: string
}

const isValidNumber = (value: string) => /^\d+$/.test(value)

export const validateAddNewSocialContact = (form: AddNewSocialPinPhoneContactForm) => {
  const errors: Record<string, { text: string }> = {}

  if (!form.firstName || form.firstName.trim() === '') {
    errors.firstName = { text: "Enter the contact's first name" }
  }

  if (!form.lastName || form.lastName.trim() === '') {
    errors.lastName = { text: "Enter the contact's last name" }
  }

  if (!form.dateOfBirthOrAge) {
    errors.dateOfBirthOrAge = { text: 'Select an answer about the contact’s date of birth' }
  } else if (form.dateOfBirthOrAge === 'dateofbirth') {
    const day = form['dob-day']
    const month = form['dob-month']
    const year = form['dob-year']
    const isDayInValid = !day || day.trim() === '' || !isValidNumber(day.trim())
    const isMonthInValid = !month || month.trim() === '' || !isValidNumber(day.trim())
    const isYearInValid = !year || year.trim() === '' || !isValidNumber(day.trim())

    if (isDayInValid || isMonthInValid || isYearInValid) {
      const dobErrorMessage = 'Date must include a day, month and year'

      errors.dob = { text: dobErrorMessage }
      if (isDayInValid) errors['dob-day'] = { text: dobErrorMessage }
      if (isMonthInValid) errors['dob-month'] = { text: dobErrorMessage }
      if (isYearInValid) errors['dob-year'] = { text: dobErrorMessage }
    } else {
      const enteredDate = new Date(`${year}-${month}-${day}`)
      const today = new Date()

      if (enteredDate > today) {
        const dobErrorMessage = 'The date must be in the past'

        errors.dob = { text: dobErrorMessage }
        errors['dob-day'] = { text: dobErrorMessage }
        errors['dob-month'] = { text: dobErrorMessage }
        errors['dob-year'] = { text: dobErrorMessage }
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

  if (!form.telephone1 || form.telephone1.trim() === '' || !isValidNumber(form.telephone1.trim())) {
    errors.telephone1 = { text: 'Select the contact’s phone number' }
  }

  return errors
}
