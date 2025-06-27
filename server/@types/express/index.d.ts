import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    applicationData?: ApplicationData
  }

  interface ApplicationData {
    type?: ApplicationType
    prisonerId?: string
    prisonerName?: string
    date?: string
    earlyDaysCentre?: boolean
    additionalData?: AdditionalApplicationData
  }

  interface ApplicationType {
    value: string
    name: string
    apiValue: string
  }

  type AdditionalApplicationData =
    | SwapVOsForPinCreditDetails
    | AddEmergencyPinPhoneCreditDetails
    | SupplyListOfPinPhoneContactsDetails
    | AddNewSocialPinPhoneContactDetails

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

  interface AddNewSocialPinPhoneContactDetails {
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
