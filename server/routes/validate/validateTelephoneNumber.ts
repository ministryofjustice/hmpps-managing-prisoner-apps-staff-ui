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
