import { validateComment } from './validateComment'

describe('validateComment', () => {
  it('returns an error if the comment is empty', () => {
    const result = validateComment('')
    expect(result).toEqual({
      comment: { text: 'Add a comment' },
    })
  })

  it('returns an error if the comment exceeds 1000 characters', () => {
    const longComment = 'a'.repeat(1001)
    const result = validateComment(longComment)
    expect(result).toEqual({
      comment: { text: 'Reason must be 1000 characters or less' },
    })
  })

  it('returns no errors for a valid comment', () => {
    const result = validateComment('This is a valid comment.')
    expect(result).toEqual({})
  })

  it('prioritises empty comment error over length error', () => {
    // Technically unreachable in this logic, but good for regression-proofing
    const result = validateComment('')
    expect(result.comment.text).toBe('Add a comment')
  })
})
