import { validateAddNewSocialContact } from './validateNewSocialPinPhoneContact'
import type { AddNewSocialPinPhoneContactForm } from './validateNewSocialPinPhoneContact'

describe(validateAddNewSocialContact.name, () => {
  const validForm: AddNewSocialPinPhoneContactForm = {
    earlyDaysCentre: 'yes',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirthOrAge: 'dateofbirth',
    'dob-day': '01',
    'dob-month': '01',
    'dob-year': '1990',
    relationship: 'friend',
    telephone1: '07123456789',
  }

  it('should return error if firstName is missing', () => {
    const result = validateAddNewSocialContact({ ...validForm, firstName: '' }, false)

    expect(result).toMatchObject({
      firstName: { text: 'Enter the contact’s first name' },
    })
  })

  it('should return error if lastName is missing', () => {
    const result = validateAddNewSocialContact({ ...validForm, lastName: '' }, false)

    expect(result).toMatchObject({
      lastName: { text: 'Enter the contact’s last name' },
    })
  })

  it('should return error if dateOfBirthOrAge is missing', () => {
    const result = validateAddNewSocialContact({ ...validForm, dateOfBirthOrAge: undefined }, false)

    expect(result).toMatchObject({
      dateOfBirthOrAge: { text: 'Select an answer about the contact’s date of birth' },
    })
  })

  it('should return error if date fields are empty', () => {
    const result = validateAddNewSocialContact(
      {
        ...validForm,
        'dob-day': '',
        'dob-month': '',
        'dob-year': '',
      },
      false,
    )

    expect(result).toMatchObject({
      dob: { text: 'Enter the contact’s date of birth' },
      'dob-day': { text: 'Enter the contact’s date of birth' },
      'dob-month': { text: 'Enter the contact’s date of birth' },
      'dob-year': { text: 'Enter the contact’s date of birth' },
    })
  })

  it('should return error if day or month is missing', () => {
    const result = validateAddNewSocialContact(
      {
        ...validForm,
        'dob-day': '',
        'dob-month': '',
      },
      false,
    )

    expect(result).toMatchObject({
      dob: { text: 'Date must include a day, a month and a year' },
      'dob-day': { text: 'Date must include a day, a month and a year' },
      'dob-month': { text: 'Date must include a day, a month and a year' },
    })
  })

  it('should return error if year is in the future', () => {
    const nextYear = new Date().getFullYear() + 1
    const result = validateAddNewSocialContact(
      {
        ...validForm,
        'dob-day': '01',
        'dob-month': '01',
        'dob-year': `${nextYear}`,
      },
      false,
    )

    expect(result).toMatchObject({
      dob: { text: 'Date must be in the past' },
      'dob-day': { text: 'Date must be in the past' },
      'dob-month': { text: 'Date must be in the past' },
      'dob-year': { text: 'Date must be in the past' },
    })
  })

  it('should return error if relationship is missing', () => {
    const result = validateAddNewSocialContact({ ...validForm, relationship: '' }, false)

    expect(result).toMatchObject({
      relationship: { text: 'Select a relationship' },
    })
  })

  it('should return error if telephone1 is missing', () => {
    const result = validateAddNewSocialContact({ ...validForm, telephone1: '' }, false)

    expect(result).toMatchObject({
      telephone1: { text: 'Enter the contact’s phone number' },
    })
  })

  it('should return error if telephone1 is not a number', () => {
    const result = validateAddNewSocialContact({ ...validForm, telephone1: 'ABC123' }, false)

    expect(result).toMatchObject({
      telephone1: { text: 'Enter a phone number in the correct format' },
    })
  })

  it('should return error if telephone1 is invalid number', () => {
    const result = validateAddNewSocialContact({ ...validForm, telephone1: '+1234567890' }, false)

    expect(result).toMatchObject({
      telephone1: { text: 'You have entered an invalid number' },
    })
  })

  it('should not return error for valid telephone1', () => {
    const result = validateAddNewSocialContact({ ...validForm, telephone1: '020 7946 0018' }, false)

    expect(result.telephone1).toBeUndefined()
  })
})
