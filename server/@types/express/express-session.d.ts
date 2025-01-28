import 'express-session'

declare module 'express-session' {
  interface SessionData {
    data?: {
      appType: {
        value: string
        name: string
      }
    }
  }
}
