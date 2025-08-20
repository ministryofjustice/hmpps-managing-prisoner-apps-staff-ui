import validatePrisonerDetails from './validatePrisonerDetails'

describe(validatePrisonerDetails.name, () => {
  const APPLICATION_TYPE = {
    key: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
    value: 'add-social-pin-phone-contact',
    name: 'Add new social PIN phone contact',
  }
  const VALID_PRISON_NUMBER = 'A1234CC'

  const ERRORS = {
    prisonNumber: { text: 'Enter a valid prison number' },
    dateString: { text: 'Enter or select a valid date' },
    earlyDaysCentre: { text: 'Select yes if this person is in the first night or early days centre' },
  }

  describe('when inputs are valid', () => {
    it('returns no errors', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, VALID_PRISON_NUMBER, true)
      expect(errors).toEqual({})
    })
  })

  describe('prisonNumber validation', () => {
    it('returns an error if prisonNumber is missing', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, '', true)
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })

    it('returns an error if prisonNumber format is invalid', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, 'A12345CC', true)
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })

    it('returns an error if prisonNumber contains lowercase letters', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, 'a1234bc', true)
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })
  })

  describe('when multiple fields are invalid', () => {
    it('returns all relevant errors', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, '', undefined)
      expect(errors).toEqual({
        prisonNumber: ERRORS.prisonNumber,
        earlyDaysCentre: ERRORS.earlyDaysCentre,
      })
    })
  })
})
