import { getAppTypeLogDetailsData } from './getAppTypeLogDetails'

describe(getAppTypeLogDetailsData.name, () => {
  describe('when isGeneric is true', () => {
    it('returns GenericAppType with details string', () => {
      const result = getAppTypeLogDetailsData(1, { details: 'Generic details' }, true)

      expect(result).toEqual({ details: 'Generic details' })
    })

    it('returns empty string when details is not a string', () => {
      const result = getAppTypeLogDetailsData(1, { details: 123 }, true)

      expect(result).toEqual({ details: '' })
    })

    it('returns empty string when details is missing', () => {
      const result = getAppTypeLogDetailsData(1, {}, true)

      expect(result).toEqual({ details: '' })
    })

    it('returns empty string when additionalData is null', () => {
      const result = getAppTypeLogDetailsData(1, null, true)

      expect(result).toEqual({ details: '' })
    })
  })

  describe('when isGeneric is false', () => {
    describe('and id is null', () => {
      it('returns null', () => {
        const result = getAppTypeLogDetailsData(null, {}, false)

        expect(result).toBeNull()
      })
    })

    describe('and id is 1 (Emergency Credit)', () => {
      it('returns EmergencyCreditAppType with amount and reason', () => {
        const data = { amount: '10.50', reason: 'Emergency call needed' }
        const result = getAppTypeLogDetailsData(1, data, false)

        expect(result).toEqual({
          type: 5,
          amount: '10.50',
          reason: 'Emergency call needed',
        })
      })

      it('returns empty strings when fields are missing', () => {
        const result = getAppTypeLogDetailsData(1, {}, false)

        expect(result).toEqual({
          type: 5,
          amount: '',
          reason: '',
        })
      })
    })

    describe('and id is 2 (Add Official Contact)', () => {
      it('returns AddNewOfficialContactAppType with all fields', () => {
        const data = {
          firstName: 'John',
          lastName: 'Smith',
          organisation: 'Legal Aid',
          relationship: 'Solicitor',
          telephone1: '01234567890',
          telephone2: '07890123456',
        }
        const result = getAppTypeLogDetailsData(2, data, false)

        expect(result).toEqual({
          type: 1,
          firstName: 'John',
          lastName: 'Smith',
          organisation: 'Legal Aid',
          relationship: 'Solicitor',
          telephone1: '01234567890',
          telephone2: '07890123456',
        })
      })

      it('uses company field when organisation is missing', () => {
        const data = {
          firstName: 'John',
          lastName: 'Smith',
          company: 'ABC Corp',
          relationship: 'Solicitor',
          telephone1: '01234567890',
        }
        const result = getAppTypeLogDetailsData(2, data, false)

        expect(result).toEqual({
          type: 1,
          firstName: 'John',
          lastName: 'Smith',
          organisation: 'ABC Corp',
          relationship: 'Solicitor',
          telephone1: '01234567890',
          telephone2: '',
        })
      })

      it('returns empty strings for missing fields', () => {
        const result = getAppTypeLogDetailsData(2, {}, false)

        expect(result).toEqual({
          type: 1,
          firstName: '',
          lastName: '',
          organisation: '',
          relationship: '',
          telephone1: '',
          telephone2: '',
        })
      })
    })

    describe('and id is 3 (Add Social Contact)', () => {
      it('returns AddNewSocialContactAppType with all fields', () => {
        const data = {
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirthOrAge: 'dateofbirth' as const,
          dob: { day: '15', month: '06', year: '1990' },
          relationship: 'Sister',
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4',
          townOrCity: 'London',
          postcode: 'SW1A 1AA',
          country: 'UK',
          telephone1: '01234567890',
          telephone2: '07890123456',
        }
        const result = getAppTypeLogDetailsData(3, data, false)

        expect(result).toEqual({
          type: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirthOrAge: 'dateofbirth',
          dob: { day: '15', month: '06', year: '1990' },
          age: undefined,
          relationship: 'Sister',
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4',
          townOrCity: 'London',
          postcode: 'SW1A 1AA',
          country: 'UK',
          telephone1: '01234567890',
          telephone2: '07890123456',
        })
      })

      it('handles age instead of dob', () => {
        const data = {
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirthOrAge: 'age' as const,
          age: '35',
          relationship: 'Sister',
          telephone1: '01234567890',
        }
        const result = getAppTypeLogDetailsData(3, data, false)

        expect(result).toEqual({
          type: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirthOrAge: 'age',
          dob: undefined,
          age: '35',
          relationship: 'Sister',
          addressLine1: undefined,
          addressLine2: undefined,
          townOrCity: undefined,
          postcode: undefined,
          country: undefined,
          telephone1: '01234567890',
          telephone2: '',
        })
      })

      it('returns empty strings for missing required fields', () => {
        const result = getAppTypeLogDetailsData(3, {}, false)

        expect(result).toEqual({
          type: 2,
          firstName: '',
          lastName: '',
          dateOfBirthOrAge: undefined,
          dob: undefined,
          age: undefined,
          relationship: '',
          addressLine1: undefined,
          addressLine2: undefined,
          townOrCity: undefined,
          postcode: undefined,
          country: undefined,
          telephone1: '',
          telephone2: '',
        })
      })
    })

    describe('and id is 4 (Remove Contact)', () => {
      it('returns RemoveContactAppType with all fields', () => {
        const data = {
          firstName: 'Bob',
          lastName: 'Jones',
          telephone1: '01234567890',
          telephone2: '07890123456',
          relationship: 'Friend',
        }
        const result = getAppTypeLogDetailsData(4, data, false)

        expect(result).toEqual({
          type: 3,
          firstName: 'Bob',
          lastName: 'Jones',
          telephone1: '01234567890',
          telephone2: '07890123456',
          relationship: 'Friend',
        })
      })

      it('returns empty strings for missing fields', () => {
        const result = getAppTypeLogDetailsData(4, {}, false)

        expect(result).toEqual({
          type: 3,
          firstName: '',
          lastName: '',
          telephone1: '',
          telephone2: '',
          relationship: '',
        })
      })
    })

    describe('and id is 5 (Swap VOs)', () => {
      it('returns SwapVOsAppType with details', () => {
        const data = { details: 'Want to swap 2 VOs for credit' }
        const result = getAppTypeLogDetailsData(5, data, false)

        expect(result).toEqual({
          type: 4,
          details: 'Want to swap 2 VOs for credit',
        })
      })

      it('returns empty string when details is missing', () => {
        const result = getAppTypeLogDetailsData(5, {}, false)

        expect(result).toEqual({
          type: 4,
          details: '',
        })
      })
    })

    describe('and id is 6 (Supply List of Contacts)', () => {
      it('returns SupplyListOfContactsAppType with details', () => {
        const data = { details: 'Need updated contact list' }
        const result = getAppTypeLogDetailsData(6, data, false)

        expect(result).toEqual({
          type: 6,
          details: 'Need updated contact list',
        })
      })

      it('returns empty string when details is missing', () => {
        const result = getAppTypeLogDetailsData(6, {}, false)

        expect(result).toEqual({
          type: 6,
          details: '',
        })
      })
    })

    describe('and id is 7 (General Enquiry)', () => {
      it('returns GeneralEnquiryAppType with details', () => {
        const data = { details: 'Question about phone credits' }
        const result = getAppTypeLogDetailsData(7, data, false)

        expect(result).toEqual({
          type: 7,
          details: 'Question about phone credits',
        })
      })

      it('returns empty string when details is missing', () => {
        const result = getAppTypeLogDetailsData(7, {}, false)

        expect(result).toEqual({
          type: 7,
          details: '',
        })
      })
    })

    describe('and id is not recognized', () => {
      it('returns null for unknown id', () => {
        const result = getAppTypeLogDetailsData(999, { details: 'test' }, false)

        expect(result).toBeNull()
      })
    })
  })
})
