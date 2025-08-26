import validatePrisonerDetails from './validatePrisonerDetails'

describe(validatePrisonerDetails.name, () => {
  const VALID_PRISON_NUMBER = 'A1234CC'

  const ERRORS = {
    prisonNumber: { text: 'Enter a valid prison number' },
  }

  describe('when inputs are valid', () => {
    it('returns no errors', () => {
      const errors = validatePrisonerDetails(VALID_PRISON_NUMBER)
      expect(errors).toEqual({})
    })
  })

  describe('prisonNumber validation', () => {
    it('returns an error if prisonNumber is missing', () => {
      const errors = validatePrisonerDetails('')
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })

    it('returns an error if prisonNumber format is invalid', () => {
      const errors = validatePrisonerDetails('A12345CC')
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })

    it('returns an error if prisonNumber contains lowercase letters', () => {
      const errors = validatePrisonerDetails('a1234bc')
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })
  })

  describe('when multiple fields are invalid', () => {
    it('returns all relevant errors', () => {
      const errors = validatePrisonerDetails('')
      expect(errors).toEqual({
        prisonNumber: ERRORS.prisonNumber,
      })
    })
  })
})
