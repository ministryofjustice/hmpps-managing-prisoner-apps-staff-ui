import { validatePrisonerDetails } from './validatePrisonerDetails'

describe('validatePrisonerDetails', () => {
  it('should return an empty object when there are no errors', () => {
    const errors = validatePrisonerDetails('A1234BC', '2023-04-10')

    expect(errors).toEqual({})
  })

  it('should return an error for missing prisonNumber', () => {
    const errors = validatePrisonerDetails('', '2023-04-10')

    expect(errors).toEqual({
      prisonNumber: { text: 'Enter a valid prison number' },
    })
  })

  it('should return an error for missing dateString', () => {
    const errors = validatePrisonerDetails('A1234BC', '')

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
