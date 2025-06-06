import { validateTextField } from './validateTextField'

describe('validateTextFieldLength', () => {
  it('should return an empty object when the field is empty (optional field)', () => {
    const errors = validateTextField({ fieldValue: '', fieldName: 'Details' })

    expect(errors).toEqual({})
  })

  it('should return an empty object when the field is within 1000 characters', () => {
    const validText = 'A'.repeat(1000)
    const errors = validateTextField({ fieldValue: validText, fieldName: 'Details' })

    expect(errors).toEqual({})
  })

  it('should return an error when the field exceeds 1000 characters', () => {
    const longText = 'A'.repeat(1001)
    const errors = validateTextField({ fieldValue: longText, fieldName: 'Details' })

    expect(errors).toEqual({
      Details: { text: 'Details must be 1000 characters or less' },
    })
  })

  it('should return an error with a dynamic field name', () => {
    const longText = 'A'.repeat(1001)
    const errors = validateTextField({ fieldValue: longText, fieldName: 'Comments' })

    expect(errors).toEqual({
      Comments: { text: 'Comments must be 1000 characters or less' },
    })
  })
})
