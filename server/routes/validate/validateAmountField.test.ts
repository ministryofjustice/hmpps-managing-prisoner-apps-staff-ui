import { validateAmountField } from './validateAmountField'

describe('validateAmountField', () => {
  it('should return an error when the field is required but empty', () => {
    const { errors } = validateAmountField('', 'Amount', true)

    expect(errors).toEqual({
      Amount: { text: 'Check the amount' },
    })
  })

  it('should return an error when the amount is a string with non-numeric characters', () => {
    const { errors } = validateAmountField('£3.50', 'Amount', true)

    expect(errors).toEqual({
      Amount: { text: 'Check the amount' },
    })
  })

  it('should return no error when the amount is a valid integer', () => {
    const { errors, value } = validateAmountField('1', 'Amount', true)

    expect(errors).toEqual({})
    expect(value).toEqual('1')
  })

  it('should return an error when the amount is a decimal number', () => {
    const { errors } = validateAmountField('3.5', 'Amount', true)

    expect(errors).toEqual({
      Amount: { text: 'Check the amount' },
    })
  })

  it('should return an error when the amount contains letters', () => {
    const { errors } = validateAmountField('three', 'Amount', true)

    expect(errors).toEqual({
      Amount: { text: 'Check the amount' },
    })
  })

  it('should return no error when the amount contains a valid number with leading spaces', () => {
    const { errors, value } = validateAmountField(' 3 ', 'Amount', true)

    expect(errors).toEqual({})
    expect(value).toEqual('3')
  })

  it('should return an error when the amount is zero', () => {
    const { errors } = validateAmountField('0', 'Amount', true)

    expect(errors).toEqual({
      Amount: { text: 'Check the amount' },
    })
  })
})
