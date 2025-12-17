import {
  AddEmergencyPinPhoneCreditDetails,
  AddNewOfficialPinPhoneContactDetails,
  AddNewSocialPinPhoneContactDetails,
  RemovePinPhoneContactDetails,
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

export type GenericAppType = {
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
  | GenericAppType

type AppTypeHandler = (data: unknown) => AppTypeData

const createEmergencyCreditHandler = (): AppTypeHandler => data => {
  const { amount = '', reason = '' } = data as AddEmergencyPinPhoneCreditDetails
  return { type: 5, amount, reason }
}

const createOfficialContactHandler = (): AppTypeHandler => data => {
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
}

const createSocialContactHandler = (): AppTypeHandler => data => {
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
}

const createRemoveContactHandler = (): AppTypeHandler => data => {
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
}

const createDetailsHandler =
  (type: 4 | 6 | 7): AppTypeHandler =>
  data => {
    const details = (data as { details?: string })?.details || ''
    return { type, details }
  }

const APP_TYPE_HANDLERS: Record<number, AppTypeHandler> = {
  1: createEmergencyCreditHandler(),
  2: createOfficialContactHandler(),
  3: createSocialContactHandler(),
  4: createRemoveContactHandler(),
  5: createDetailsHandler(4),
  6: createDetailsHandler(6),
  7: createDetailsHandler(7),
}

export function getAppTypeLogDetailsData(
  id: number | null,
  additionalData: unknown,
  isGeneric: boolean,
): AppTypeData | null {
  if (isGeneric) {
    const details = (additionalData as Record<string, unknown>)?.details
    return { details: typeof details === 'string' ? details : '' }
  }

  if (id === null) {
    return null
  }

  const handler = APP_TYPE_HANDLERS[id]
  return handler ? handler(additionalData) : null
}
