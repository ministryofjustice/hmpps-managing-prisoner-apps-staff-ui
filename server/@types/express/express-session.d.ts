import 'express-session'

declare module 'express-session' {
  interface SessionData {
    applicationData?: {
      type: {
        value: string
        name: string
      }
    }
  }
}
