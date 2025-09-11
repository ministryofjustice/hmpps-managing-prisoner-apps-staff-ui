import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const sanitisePhoneNumber = (input: string): { mainNumber: string; extension: string | null } | null => {
  if (!input) return null

  const trimmed = input.trim()
  const regex = /^(.+?)\s*(?:\(?\s*(?:ext\.?|extension|x)\.?\s*(\d{1,7})\s*\)?|\((\d{1,7})\))?$/i
  const match = trimmed.match(regex)

  if (!match) return null

  const numberPart = match[1]
  const extension = match[2] ?? match[3] ?? null

  if (/[a-zA-Z]/.test(numberPart)) return null

  const mainNumber = numberPart.replace(/[^0-9()+]/g, '')
  const digitCount = mainNumber.replace(/[^0-9]/g, '').length

  if (digitCount < 10 || digitCount > 15) return null

  return { mainNumber, extension }
}

export const validatePhoneNumber = (input: string): 'valid' | 'invalid_format' | 'invalid_number' => {
  const sanitisedResult = sanitisePhoneNumber(input)
  if (!sanitisedResult) return 'invalid_format'

  const { mainNumber, extension } = sanitisedResult

  const digitsOnly = mainNumber.replace(/[()]/g, '')

  let parsed

  if (digitsOnly.startsWith('00')) {
    parsed = parsePhoneNumberFromString(digitsOnly.replace(/^00/, '+'))
  } else if (/^[1-9]\d{7,}$/.test(digitsOnly)) {
    parsed = parsePhoneNumberFromString(`+${digitsOnly}`)
  } else {
    parsed = parsePhoneNumberFromString(digitsOnly, 'GB')
  }

  if (extension && !/^\d{1,7}$/.test(extension)) {
    return 'invalid_format'
  }

  if (!parsed) return 'invalid_format'

  return parsed.isValid() ? 'valid' : 'invalid_number'
}

export const errorMessages = {
  phoneRequired: 'Enter the contact’s phone number',
  invalidFormat: 'Enter a phone number in the correct format',
  invalidNumber: 'You have entered an invalid number',
}

type PhoneFieldName = 'telephone1' | 'telephone2'

/* eslint-disable no-param-reassign */
export function validateAndAssignError<T extends Partial<Record<PhoneFieldName, string>>>({
  form,
  errors,
  fieldName,
  isRequired,
}: {
  form: T
  errors: Record<string, { text: string }>
  fieldName: PhoneFieldName
  isRequired: boolean
}) {
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
/* eslint-enable no-param-reassign */
