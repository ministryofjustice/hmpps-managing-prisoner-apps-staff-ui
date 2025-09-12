import { sanitisePhoneNumber, validatePhoneNumber } from './validateTelephoneNumber'

describe('sanitisePhoneNumber', () => {
  it('returns null if input is empty', () => {
    expect(sanitisePhoneNumber('')).toBeNull()
  })

  it('strips invalid characters but keeps digits and brackets, parses extension', () => {
    expect(sanitisePhoneNumber('1-212-456-7890(1234)')).toEqual({
      mainNumber: '12124567890',
      extension: '1234',
    })
    expect(sanitisePhoneNumber('(123) 456 7890')).toEqual({
      mainNumber: '(123)4567890',
      extension: null,
    })
    expect(sanitisePhoneNumber('123 456 7890')).toEqual({
      mainNumber: '1234567890',
      extension: null,
    })
    expect(sanitisePhoneNumber('123456 ext123')).toBeNull()
    expect(sanitisePhoneNumber('123456 extension 4567')).toBeNull()
    expect(sanitisePhoneNumber('123456 EXTENSION4567')).toBeNull()
    expect(sanitisePhoneNumber('123456 EXT4567')).toBeNull()
    expect(sanitisePhoneNumber('123456 x4567')).toBeNull()
  })

  it('returns null if main number length is less than 6 or more than 15', () => {
    expect(sanitisePhoneNumber('123456789')).toBeNull()
    expect(sanitisePhoneNumber('1'.repeat(16))).toBeNull()
  })

  it('returns null for invalid patterns', () => {
    expect(sanitisePhoneNumber('abc def ghi')).toBeNull()
    expect(sanitisePhoneNumber('12345x123')).toBeNull()
    expect(sanitisePhoneNumber('(123)45')).toBeNull()
  })
})

describe('validatePhoneNumber', () => {
  const isValid = (input: string) => validatePhoneNumber(input) === 'valid'

  it('returns false for invalid or empty inputs', () => {
    expect(isValid('')).toBe(false)
    expect(isValid('+1234567890')).toBe(false)
    expect(isValid('abc def')).toBe(false)
    expect(isValid('12345')).toBe(false)
  })

  it('returns true for valid numbers without extension', () => {
    expect(isValid('020 7946 0018')).toBe(true)
    expect(isValid('(020) 7946 0018')).toBe(true)
    expect(isValid('12124567890')).toBe(true)
  })

  it('returns true for valid numbers with valid extension', () => {
    expect(isValid('1-212-456-7890(1234)')).toBe(true)
    expect(isValid('1-212-456-7890 ext1234')).toBe(true)
    expect(isValid('1-212-456-7890 EXTENSION1234')).toBe(true)
    expect(isValid('1-212-456-7890 x1234')).toBe(true)
  })

  it('returns false for invalid extensions', () => {
    expect(isValid('1-212-456-7890 ext12345678')).toBe(false)
    expect(isValid('1-212-456-7890 ext12a4')).toBe(false)
  })

  it('returns false if main number is longer than 15 digits (libphonenumber limit)', () => {
    const longNumber = '1'.repeat(16)
    expect(isValid(longNumber)).toBe(false)
  })
})
