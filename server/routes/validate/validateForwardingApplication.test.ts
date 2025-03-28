import { validateForwardingApplication } from './validateForwardingApplication'

describe('validateForwardingApplication', () => {
  it('should return an empty object when there are no errors', () => {
    const errors = validateForwardingApplication('Some Department', 'Reason must be 1000 characters or less')

    expect(errors).toEqual({})
  })

  it('should return an error for missing forwardTo', () => {
    const errors = validateForwardingApplication('', 'Reason must be 1000 characters or less')

    expect(errors).toEqual({
      forwardTo: { text: 'Choose where to send' },
    })
  })

  it('should return an error for forwardingReason longer than 1000 characters', () => {
    const longReason = 'A'.repeat(1001)
    const errors = validateForwardingApplication('Some Department', longReason)

    expect(errors).toEqual({
      forwardingReason: { text: 'Reason must be 1000 characters or less' },
    })
  })

  it('should return both errors for missing forwardTo and long forwardingReason', () => {
    const longReason = 'A'.repeat(1001)
    const errors = validateForwardingApplication('', longReason)

    expect(errors).toEqual({
      forwardTo: { text: 'Choose where to send' },
      forwardingReason: { text: 'Reason must be 1000 characters or less' },
    })
  })

  it('should return no errors if forwardingReason is exactly 1000 characters', () => {
    const validReason = 'A'.repeat(1000)
    const errors = validateForwardingApplication('Some Department', validReason)

    expect(errors).toEqual({})
  })
})
