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

    updateSessionData(req, { prisonerName: 'John Doe', date: new Date('2024-02-05') })

    expect(req.session.applicationData).toEqual({
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      prisonerName: 'John Doe',
      date: new Date('2024-02-05'),
    })
  })

  it('should not overwrite nested objects but merge updates', () => {
    req.session.applicationData = {
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      additionalData: { swapVOsToPinCreditDetails: 'Old value' },
    }

    updateSessionData(req, {
      additionalData: { swapVOsToPinCreditDetails: 'New value' },
    })

    expect(req.session.applicationData).toEqual({
      type: { name: 'Swap VOs', value: 'swap-vos', apiValue: 'swap-vos' },
      additionalData: { swapVOsToPinCreditDetails: 'New value' },
    })
  })

  it('should handle undefined session gracefully', () => {
    req.session = undefined

    expect(() => updateSessionData(req, { prisonerName: 'John Doe' })).toThrow()
  })
})
