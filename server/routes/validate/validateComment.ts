// eslint-disable-next-line import/prefer-default-export
export const validateComment = (comment: string) => {
  const errors: Record<string, { text: string }> = {}

  if (comment.length === 0) {
    errors.comment = { text: 'Add a comment' }
  } else if (comment.length > 1000) {
    errors.comment = { text: 'Reason must be 1000 characters or less' }
  }

  return errors
}
