type AddNewSocialPinPhoneContactForm = {
  firstName: string
  lastName: string
  dateOfBirthOrAge: 'dateofbirth' | 'age' | 'donotknow'
  dob?: {
    day: string
    month: string
    year: string
  }
  age?: string
  relationship: string
  telephone1: string
}

// eslint-disable-next-line import/prefer-default-export
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
    const { day, month, year } = form.dob || {}

    if (!day && !month && !year) {
      errors.dob = { text: 'Enter the contact’s date of birth' }
    } else if (!day || !month || !year) {
      errors.dob = { text: 'Date must include a day, month and year' }
    } else {
      const currentYear = new Date().getFullYear()
      const enteredYear = parseInt(year, 10)

      if (enteredYear > currentYear) {
        errors.dob = { text: 'The date must be in the past' }
      }
    }
  } else if (form.dateOfBirthOrAge === 'age') {
    if (!form.age || form.age.trim() === '') {
      errors.age = { text: 'Enter the contact’s age' }
    }
  }
  if (!form.relationship || form.relationship === '') {
    errors.relationship = { text: 'Select a relationship' }
  }

  if (!form.telephone1 || form.telephone1.trim() === '') {
    errors.telephone1 = { text: 'Select the contact’s phone number' }
  }

  return errors
}
