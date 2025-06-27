import {
  AddEmergencyPinPhoneCreditDetails,
  SwapVOsForPinCreditDetails,
  SupplyListOfPinPhoneContactsDetails,
  AddNewSocialPinPhoneContactDetails,
  ApplicationType,
} from 'express-session'

type AppTypeData = {
  details: string
  amount: string
  reason: string
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
} | null

// eslint-disable-next-line import/prefer-default-export
export function getAppTypeLogDetailsData(applicationType: ApplicationType, additionalData: unknown): AppTypeData {
  let details = ''
  let amount = ''
  let reason = ''
  let firstName = ''
  let lastName = ''
  let dateOfBirthOrAge: 'dateofbirth' | 'age' | 'donotknow' = 'donotknow'
  let dob: { day: string; month: string; year: string } | undefined
  let age: string | undefined
  let relationship = ''
  let addressLine1: string | undefined
  let addressLine2: string | undefined
  let townOrCity: string | undefined
  let postcode: string | undefined
  let country: string | undefined
  let telephone1: string | undefined
  let telephone2: string | undefined

  switch (applicationType.apiValue) {
    case 'PIN_PHONE_ADD_NEW_CONTACT': {
      const data = additionalData as AddNewSocialPinPhoneContactDetails
      firstName = data.firstName || ''
      lastName = data.lastName || ''
      dateOfBirthOrAge = data.dateOfBirthOrAge || 'donotknow'
      dob = data.dob
      age = data.age
      relationship = data.relationship || ''
      addressLine1 = data.addressLine1
      addressLine2 = data.addressLine2
      townOrCity = data.townOrCity
      postcode = data.postcode
      country = data.country
      telephone1 = data.telephone1 || ''
      telephone2 = data.telephone2 || ''
      break
    }
    case 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS': {
      const data = additionalData as SwapVOsForPinCreditDetails
      details = data.details || ''
      break
    }
    case 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP': {
      const data = additionalData as AddEmergencyPinPhoneCreditDetails
      amount = data.amount || ''
      reason = data.reason || ''
      break
    }

    case 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS': {
      const data = additionalData as SupplyListOfPinPhoneContactsDetails
      details = data.details || ''
      break
    }

    default:
      return null
  }

  return {
    details,
    amount,
    reason,
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
