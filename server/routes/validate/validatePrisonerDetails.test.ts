import validatePrisonerDetails from './validatePrisonerDetails'

describe('validatePrisonerDetails', () => {
  it('should return an empty object when there are no errors', () => {
    const errors = validatePrisonerDetails('A1234CC', '10/04/2023')

    expect(errors).toEqual({})
  })

  it('should return an error for missing prisonNumber', () => {
    const errors = validatePrisonerDetails('', '10/04/2023')

    expect(errors).toEqual({
      prisonNumber: { text: 'Enter a valid prison number' },
    })
  })

  it('should return an error for invalid prisonNumber', () => {
    const errors = validatePrisonerDetails('A12345CC', '10/04/2023')

    expect(errors).toEqual({
      prisonNumber: { text: 'Enter a valid prison number' },
    })
  })

  it('should return an error for prison number with lowercase letters', () => {
    const errors = validatePrisonerDetails('a1234bc', '10/04/2023')

    expect(errors).toEqual({
      prisonNumber: { text: 'Enter a valid prison number' },
    })
  })

  it('should return an error for invalid date format', () => {
    const errors = validatePrisonerDetails('A1234CC', '2023-04-10')

    expect(errors).toEqual({
      dateString: { text: 'Enter or select a valid date' },
    })
  })

  it('should return an error for missing date field', () => {
    const errors = validatePrisonerDetails('A1234CC', '')

    expect(errors).toEqual({
      dateString: { text: 'Enter or select a valid date' },
    })
  })

  it('should return errors for both missing prisonNumber and dateString', () => {
    const errors = validatePrisonerDetails('', '')

    expect(errors).toEqual({
      prisonNumber: { text: 'Enter a valid prison number' },
      dateString: { text: 'Enter or select a valid date' },
    })
  })
})
