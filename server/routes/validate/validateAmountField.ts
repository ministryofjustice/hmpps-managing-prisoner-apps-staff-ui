// eslint-disable-next-line import/prefer-default-export
export const validateAmountField = (
  amount: string,
  fieldName: string,
  isRequired: boolean = false,
): { errors: Record<string, { text: string }>; value?: string } => {
  const errors: Record<string, { text: string }> = {}

  const amountErrorMessage = 'Check the amount'

  if (isRequired && (!amount || amount.trim() === '')) {
    errors[fieldName] = { text: amountErrorMessage }
    return { errors }
  }

  const sanitizedAmount = amount.replace(/[^0-9.]/g, '')

  if (!sanitizedAmount || sanitizedAmount.trim() === '') {
    errors[fieldName] = { text: amountErrorMessage }
    return { errors }
  }

  const numericAmount = parseFloat(sanitizedAmount)

  if (Number.isNaN(numericAmount) || !Number.isInteger(numericAmount) || numericAmount <= 0) {
    errors[fieldName] = { text: amountErrorMessage }
    return { errors }
  }

  return { errors, value: sanitizedAmount }
}
