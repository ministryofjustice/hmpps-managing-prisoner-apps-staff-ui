import {
  AddEmergencyPinPhoneCreditDetails,
  SwapVOsForPinCreditDetails,
  SupplyListOfPinPhoneContactsDetails,
  AddNewSocialPinPhoneContactDetails,
  ApplicationType,
} from 'express-session'

export type AppTypeData =
  | {
      type: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS'
      details: string
    }
  | {
      type: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP'
      amount: string
      reason: string
    }
  | {
      type: 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS'
      details: string
    }
  | {
      type: 'PIN_PHONE_ADD_NEW_CONTACT'
      firstName: string
      lastName: string
      dateOfBirthOrAge: 'dateofbirth' | 'age' | 'donotknow'
      dob?: {
        day: string
        month: string
        year: string
      }
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
  | null

export function getAppTypeLogDetailsData(applicationType: ApplicationType, additionalData: unknown): AppTypeData {
  switch (applicationType.apiValue) {
    case 'PIN_PHONE_ADD_NEW_CONTACT': {
      const data = additionalData as AddNewSocialPinPhoneContactDetails
      return {
        type: 'PIN_PHONE_ADD_NEW_CONTACT',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirthOrAge: data.dateOfBirthOrAge,
        dob: data.dob,
        age: data.age,
        relationship: data.relationship || '',
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        townOrCity: data.townOrCity,
        postcode: data.postcode,
        country: data.country,
        telephone1: data.telephone1 || '',
        telephone2: data.telephone2 || '',
      }
    }
    case 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS': {
      const data = additionalData as SwapVOsForPinCreditDetails
      return {
        type: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
        details: data.details || '',
      }
    }

    case 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP': {
      const data = additionalData as AddEmergencyPinPhoneCreditDetails
      return {
        type: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
        amount: data.amount || '',
        reason: data.reason || '',
      }
    }

    case 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS': {
      const data = additionalData as SupplyListOfPinPhoneContactsDetails
      return {
        type: 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
        details: data.details || '',
      }
    }

    default:
      return null
  }
}
