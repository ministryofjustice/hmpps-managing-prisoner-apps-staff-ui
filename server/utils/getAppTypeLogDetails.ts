import {
  AddEmergencyPinPhoneCreditDetails,
  SwapVOsForPinCreditDetails,
  SupplyListOfPinPhoneContactsDetails,
  AddNewSocialPinPhoneContactDetails,
  ApplicationType,
} from 'express-session'

export type SwapVOsAppType = {
  type: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS'
  details: string
}

export type EmergencyCreditAppType = {
  type: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP'
  amount: string
  reason: string
}

export type SupplyListOfContactsAppType = {
  type: 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS'
  details: string
}

export type AddNewSocialContactAppType = {
  type: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT'
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

export type AddNewLegalContactAppType = {
  type: 'PIN_PHONE_ADD_NEW_LEGAL_CONTACT'
  firstName: string
  lastName: string
  company: string
  relationship: string
  telephone1: string
  telephone2?: string
}

export type RemoveContactAppType = {
  type: 'PIN_PHONE_REMOVE_CONTACT'
  firstName: string
  lastName: string
  telephone1: string
  telephone2?: string
  typeOfContact?: string
}

export type AppTypeData =
  | SwapVOsAppType
  | EmergencyCreditAppType
  | SupplyListOfContactsAppType
  | AddNewSocialContactAppType
  | AddNewLegalContactAppType
  | null

export function getAppTypeLogDetailsData(applicationType: ApplicationType, additionalData: unknown): AppTypeData {
  switch (applicationType.key) {
    case 'PIN_PHONE_ADD_NEW_LEGAL_CONTACT': {
      const {
        firstName = '',
        lastName = '',
        company = '',
        relationship = '',
        telephone1 = '',
        telephone2 = '',
      } = additionalData as AddNewLegalContactAppType

      return {
        type: 'PIN_PHONE_ADD_NEW_LEGAL_CONTACT',
        firstName,
        lastName,
        company,
        relationship,
        telephone1,
        telephone2,
      }
    }

    case 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT': {
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
      } = additionalData as AddNewSocialPinPhoneContactDetails

      return {
        type: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
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
    }

    case 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS': {
      const { details = '' } = additionalData as SwapVOsForPinCreditDetails
      return {
        type: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
        details,
      }
    }

    case 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP': {
      const { amount = '', reason = '' } = additionalData as AddEmergencyPinPhoneCreditDetails
      return {
        type: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
        amount,
        reason,
      }
    }

    case 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS': {
      const { details = '' } = additionalData as SupplyListOfPinPhoneContactsDetails
      return {
        type: 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
        details,
      }
    }

    default:
      return null
  }
}
