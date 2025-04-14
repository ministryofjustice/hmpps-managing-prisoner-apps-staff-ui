import { Request } from 'express'
import { SessionData } from 'express-session'
import { updateSessionData } from './session'

describe(updateSessionData.name, () => {
  let req: Request

  beforeEach(() => {
    req = {
      session: {} as SessionData,
    } as Request
  })

  it('should initialize applicationData if it does not exist', () => {
    updateSessionData(req, { prisonerName: 'John Doe' })

    expect(req.session.applicationData).toEqual({
      prisonerName: 'John Doe',
    })
  })

  it('should update an existing field without removing other fields', () => {
    req.session.applicationData = {
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      prisonerName: 'Jane Doe',
    }

    updateSessionData(req, { prisonerName: 'John Doe' })

    expect(req.session.applicationData).toEqual({
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      prisonerName: 'John Doe',
    })
  })

  it('should add new fields while keeping existing ones', () => {
    req.session.applicationData = {
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
    }

    updateSessionData(req, { prisonerName: 'John Doe', date: '2024-02-05T00:00:00Z' })

    expect(req.session.applicationData).toEqual({
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      prisonerName: 'John Doe',
      date: '2024-02-05T00:00:00Z',
    })
  })

  it('should not overwrite nested objects but merge updates', () => {
    req.session.applicationData = {
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      additionalData: { details: 'Old value' },
    }

    updateSessionData(req, {
      additionalData: { details: 'New value' },
    })

    expect(req.session.applicationData).toEqual({
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      additionalData: { details: 'New value' },
    })
  })

  it('should handle undefined session gracefully', () => {
    req.session = undefined

    expect(() => updateSessionData(req, { prisonerName: 'John Doe' })).toThrow()
  })
})
