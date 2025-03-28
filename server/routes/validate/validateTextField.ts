// eslint-disable-next-line import/prefer-default-export
export const validateTextField = (fieldValue: string, fieldName: string, isRequired: boolean = false) => {
  const errors: Record<string, { text: string }> = {}

  const errorMessages: Record<string, string> = {
    Comments: 'Add a comment',
  }

  if (isRequired && !fieldValue) {
    errors[fieldName] = { text: errorMessages[fieldName] }
  }

  if (fieldValue && fieldValue.length > 1000) {
    errors[fieldName] = { text: `${fieldName} must be 1000 characters or less` }
  }

  return errors
}
