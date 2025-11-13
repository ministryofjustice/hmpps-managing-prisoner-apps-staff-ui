import {
  AddEmergencyPinPhoneCreditDetails,
  AddNewOfficialPinPhoneContactDetails,
  AddNewSocialPinPhoneContactDetails,
  RemovePinPhoneContactDetails,
  SupplyListOfPinPhoneContactsDetails,
  SwapVOsForPinCreditDetails,
  GeneralPinPhoneEnquiryDetails,
} from 'express-session'

export type SwapVOsAppType = {
  type: 4
  details: string
}

export type EmergencyCreditAppType = {
  type: 5
  amount: string
  reason: string
}

export type SupplyListOfContactsAppType = {
  type: 6
  details: string
}

export type GeneralEnquiryAppType = {
  type: 7
  details: string
}

export type AddNewSocialContactAppType = {
  type: 2
  firstName: string
  lastName: string
  dateOfBirthOrAge: 'dateofbirth' | 'age' | 'donotknow'
  dob?: { day: string; month: string; year: string }
  age?: string
  relationship: string
  addressLine1?: string
  addressLine2?: string
  townOrCity?: string
  postcode?: string
  country?: string
  telephone1: string
  telephone2?: string
}

export type AddNewOfficialContactAppType = {
  type: 1
  firstName: string
  lastName: string
  organisation?: string
  relationship: string
  telephone1: string
  telephone2?: string
}

export type RemoveContactAppType = {
  type: 3
  firstName: string
  lastName: string
  telephone1: string
  telephone2?: string
  relationship?: string
}

export type AppTypeData =
  | SwapVOsAppType
  | EmergencyCreditAppType
  | SupplyListOfContactsAppType
  | AddNewSocialContactAppType
  | AddNewOfficialContactAppType
  | RemoveContactAppType
  | GeneralEnquiryAppType

export function getAppTypeLogDetailsData(id: number, additionalData: unknown): AppTypeData | null {
  const handlers: Record<number, (data: unknown) => AppTypeData> = {
    1: data => {
      const { amount = '', reason = '' } = data as AddEmergencyPinPhoneCreditDetails
      return {
        type: 5,
        amount,
        reason,
      }
    },

    2: data => {
      const {
        firstName = '',
        lastName = '',
        organisation,
        company,
        relationship = '',
        telephone1 = '',
        telephone2 = '',
      } = data as AddNewOfficialPinPhoneContactDetails & { company?: string }

      return {
        type: 1,
        firstName,
        lastName,
        organisation: organisation || company || '',
        relationship,
        telephone1,
        telephone2,
      }
    },

    3: data => {
      const {
        firstName = '',
        lastName = '',
        dateOfBirthOrAge,
        dob,
        age,
        relationship = '',
        addressLine1,
        addressLine2,
        townOrCity,
        postcode,
        country,
        telephone1 = '',
        telephone2 = '',
      } = data as AddNewSocialPinPhoneContactDetails

      return {
        type: 2,
        firstName,
        lastName,
        dateOfBirthOrAge,
        dob,
        age,
        relationship,
        addressLine1,
        addressLine2,
        townOrCity,
        postcode,
        country,
        telephone1,
        telephone2,
      }
    },

    4: data => {
      const {
        firstName = '',
        lastName = '',
        telephone1 = '',
        telephone2 = '',
        relationship = '',
      } = data as RemovePinPhoneContactDetails

      return {
        type: 3,
        firstName,
        lastName,
        telephone1,
        telephone2,
        relationship,
      }
    },

    5: data => {
      const { details = '' } = data as SwapVOsForPinCreditDetails
      return {
        type: 4,
        details,
      }
    },

    6: data => {
      const { details = '' } = data as SupplyListOfPinPhoneContactsDetails
      return {
        type: 6,
        details,
      }
    },

    7: data => {
      const { details = '' } = data as GeneralPinPhoneEnquiryDetails
      return {
        type: 7,
        details,
      }
    },
  }

  const handler = handlers[id]
  return handler ? handler(additionalData) : null
}
