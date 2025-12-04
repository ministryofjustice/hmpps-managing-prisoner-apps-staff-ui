import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    applicationData?: ApplicationData
    prisonerContext?: {
      prisonerId: string
      prisonerName: string
    }
    isLoggingForSamePrisoner: boolean
    listFilters?: ListFilters
  }

  interface ApplicationData {
    additionalData?: AdditionalApplicationData
    date?: string
    earlyDaysCentre?: string
    prisonerAlertCount?: string
    prisonerExists?: string
    prisonerId?: string
    prisonerName?: string
    group?: {
      name: string
      value: string
    }
    type?: {
      key: string
      name: string
      value: string
      genericType?: boolean
      genericForm?: boolean
      legacyKey?: string
    }
    department?: string
    departmentId?: string
  }

  type ListFilters = {
    order?: string
    status?: string[]
    prisoner?: string
    priority?: string
    group?: string[]
    applicationTypeFilter?: string[]
    type?: string[]
  }

  type AdditionalApplicationData =
    | SwapVOsForPinCreditDetails
    | AddEmergencyPinPhoneCreditDetails
    | SupplyListOfPinPhoneContactsDetails
    | AddNewSocialPinPhoneContactDetails
    | AddNewOfficialPinPhoneContactDetails
    | RemovePinPhoneContactDetails
    | GeneralPinPhoneEnquiryDetails
    | GenericLogDetails

  interface SwapVOsForPinCreditDetails {
    details?: string
  }

  interface AddEmergencyPinPhoneCreditDetails {
    amount?: string
    reason?: string
  }

  interface SupplyListOfPinPhoneContactsDetails {
    details?: string
  }

  interface GeneralPinPhoneEnquiryDetails {
    details: string
  }

  interface GenericLogDetails {
    details: string
  }

  interface AddNewSocialPinPhoneContactDetails {
    earlyDaysCentre: string
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

  interface AddNewOfficialPinPhoneContactDetails {
    firstName: string
    lastName: string
    organisation?: string
    relationship: string
    telephone1: string
    telephone2?: string
  }

  interface RemovePinPhoneContactDetails {
    firstName: string
    lastName: string
    telephone1: string
    telephone2?: string
    relationship?: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: HmppsUser
    }
  }
}
