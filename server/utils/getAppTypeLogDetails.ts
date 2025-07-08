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

export type AddNewContactAppType = {
  type: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT'
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

export type AppTypeData =
  | SwapVOsAppType
  | EmergencyCreditAppType
  | SupplyListOfContactsAppType
  | AddNewContactAppType
  | null

export function getAppTypeLogDetailsData(applicationType: ApplicationType, additionalData: unknown): AppTypeData {
  switch (applicationType.key) {
    case 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT': {
      const formData = additionalData as AddNewSocialPinPhoneContactDetails
      return {
        type: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        dateOfBirthOrAge: formData.dateOfBirthOrAge,
        dob: formData.dob,
        age: formData.age,
        relationship: formData.relationship || '',
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        townOrCity: formData.townOrCity,
        postcode: formData.postcode,
        country: formData.country,
        telephone1: formData.telephone1 || '',
        telephone2: formData.telephone2 || '',
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
