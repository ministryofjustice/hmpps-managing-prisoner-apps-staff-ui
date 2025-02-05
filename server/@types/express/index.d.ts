import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    applicationData?: ApplicationData
  }

  interface ApplicationData {
    type: ApplicationType
    prisonerName: string
    date: Date
    additionalData?: AdditionalApplicationData
  }

  interface ApplicationType {
    value: string
    name: string
  }

  type AdditionalApplicationData = SwapVOsForPinCreditDetails

  interface SwapVOsForPinCreditDetails {
    swapVOsToPinCreditDetails: string
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
