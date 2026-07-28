import { validateActionAndReply } from './validateActionAndReply'

describe('validateActionAndReply', () => {
  it('should return an error if no action is selected', () => {
    const errors = validateActionAndReply('', 'Some reason')

    expect(errors.selectAction).toEqual({ text: 'Choose an action to close this application' })
  })

  it('should return an error if the actionReplyReason is longer than 1000 characters', () => {
    const longReason = 'a'.repeat(1001)
    const errors = validateActionAndReply('APPROVED', longReason)

    expect(errors.actionReplyReason).toEqual({ text: 'Reason must be 1000 characters or less' })
  })

  it('should return an error if action is "DECLINED" and actionReplyReason is empty', () => {
    const errors = validateActionAndReply('DECLINED', '')

    expect(errors.actionReplyReason).toEqual({ text: 'Add a reason' })
  })

  it('should not return an error if action is "DECLINED" and actionReplyReason is provided', () => {
    const errors = validateActionAndReply('DECLINED', 'Some reason')

    expect(errors.actionReplyReason).toBeUndefined()
  })

  it('should not return any errors if action is selected and reason is valid', () => {
    const errors = validateActionAndReply('APPROVED', 'Some valid reason')

    expect(errors).toEqual({})
  })

  it('should handle when actionReplyReason is undefined', () => {
    const errors = validateActionAndReply('DECLINED', undefined)

    expect(errors.actionReplyReason).toEqual({ text: 'Add a reason' })
  })

  it('should return an error if action is "REJECTED" and rejectedReason is empty', () => {
    const errors = validateActionAndReply('REJECTED', 'Some reason', '')

    expect(errors.rejectedReason).toEqual({ text: 'Choose the reason for this rejected application' })
  })

  it('should return an error if action is "REJECTED" and rejectedReason is not provided', () => {
    const errors = validateActionAndReply('REJECTED', 'Some reason')

    expect(errors.rejectedReason).toEqual({ text: 'Choose the reason for this rejected application' })
  })

  it('should not return an error if action is "REJECTED" and rejectedReason is provided', () => {
    const errors = validateActionAndReply('REJECTED', 'Some reason', 'Prisoner used the wrong app')

    expect(errors.rejectedReason).toBeUndefined()
  })
})
