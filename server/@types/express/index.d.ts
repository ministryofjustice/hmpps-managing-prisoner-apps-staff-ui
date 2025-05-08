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
