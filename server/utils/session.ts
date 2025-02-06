import { Request } from 'express'
import { SessionData } from 'express-session'

// eslint-disable-next-line import/prefer-default-export
export const updateSessionData = (req: Request, updates: Partial<SessionData['applicationData']>) => {
  if (!req.session.applicationData) {
    req.session.applicationData = {} as SessionData['applicationData']
  }

  req.session.applicationData = {
    ...req.session.applicationData,
    ...updates,
  }
}
