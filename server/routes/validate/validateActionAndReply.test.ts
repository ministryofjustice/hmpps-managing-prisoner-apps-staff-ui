import { validateActionAndReply } from './validateActionAndReply'

describe('validateActionAndReply', () => {
  it('should return an error if no action is selected', () => {
    const errors = validateActionAndReply('', 'Some reason')

    expect(errors.selectAction).toEqual({ text: 'Select an action' })
  })

  it('should return an error if the actionReplyReason is longer than 1000 characters', () => {
    const longReason = 'a'.repeat(1001)
    const errors = validateActionAndReply('approved', longReason)

    expect(errors.actionReplyReason).toEqual({ text: 'Reason must be 1000 characters or less' })
  })

  it('should return an error if action is "declined" and actionReplyReason is empty', () => {
    const errors = validateActionAndReply('declined', '')

    expect(errors.actionReplyReason).toEqual({ text: 'Add a reason' })
  })

  it('should not return an error if action is "declined" and actionReplyReason is provided', () => {
    const errors = validateActionAndReply('declined', 'Some reason')

    expect(errors.actionReplyReason).toBeUndefined()
  })

  it('should not return any errors if action is selected and reason is valid', () => {
    const errors = validateActionAndReply('approved', 'Some valid reason')

    expect(errors).toEqual({})
  })

  it('should handle when actionReplyReason is undefined', () => {
    const errors = validateActionAndReply('declined', undefined)

    expect(errors.actionReplyReason).toEqual({ text: 'Add a reason' })
  })
})
