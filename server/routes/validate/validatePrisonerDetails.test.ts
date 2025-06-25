import { APPLICATION_TYPES } from '../../constants/applicationTypes'
import validatePrisonerDetails from './validatePrisonerDetails'

describe('validatePrisonerDetails', () => {
  const APPLICATION_TYPE = APPLICATION_TYPES.find(type => type.apiValue === 'PIN_PHONE_ADD_NEW_CONTACT')!
  const VALID_PRISON_NUMBER = 'A1234CC'
  const VALID_DATE = '10/04/2023'

  const ERRORS = {
    prisonNumber: { text: 'Enter a valid prison number' },
    dateString: { text: 'Enter or select a valid date' },
    earlyDaysCentre: { text: 'Select if this person is in the first night or early days centre' },
  }

  describe('when inputs are valid', () => {
    it('returns no errors', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, VALID_PRISON_NUMBER, VALID_DATE, true)
      expect(errors).toEqual({})
    })
  })

  describe('prisonNumber validation', () => {
    it('returns an error if prisonNumber is missing', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, '', VALID_DATE, true)
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })

    it('returns an error if prisonNumber format is invalid', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, 'A12345CC', VALID_DATE, true)
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })

    it('returns an error if prisonNumber contains lowercase letters', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, 'a1234bc', VALID_DATE, true)
      expect(errors).toEqual({ prisonNumber: ERRORS.prisonNumber })
    })
  })

  describe('dateString validation', () => {
    it('returns an error if dateString format is invalid', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, VALID_PRISON_NUMBER, '2023-04-10', true)
      expect(errors).toEqual({ dateString: ERRORS.dateString })
    })

    it('returns an error if dateString is missing', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, VALID_PRISON_NUMBER, '', true)
      expect(errors).toEqual({ dateString: ERRORS.dateString })
    })
  })

  describe('earlyDaysCentre validation', () => {
    it('returns an error if earlyDaysCentre is undefined', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, VALID_PRISON_NUMBER, VALID_DATE, undefined)
      expect(errors).toEqual({ earlyDaysCentre: ERRORS.earlyDaysCentre })
    })
  })

  describe('when multiple fields are invalid', () => {
    it('returns all relevant errors', () => {
      const errors = validatePrisonerDetails(APPLICATION_TYPE, '', '', undefined)
      expect(errors).toEqual({
        prisonNumber: ERRORS.prisonNumber,
        dateString: ERRORS.dateString,
        earlyDaysCentre: ERRORS.earlyDaysCentre,
      })
    })
  })
})
