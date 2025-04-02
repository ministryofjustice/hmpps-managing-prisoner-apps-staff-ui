import { Request } from 'express'

// eslint-disable-next-line import/prefer-default-export
export const removeFilterFromHref = (req: Request, filterKey: string, valueToRemove: string) => {
  const newQuery = new URLSearchParams(req.query as Record<string, string | string[]>)

  newQuery.delete(filterKey) // Remove all existing occurrences of the filter

  const queryValues = req.query[filterKey]

  if (queryValues) {
    const valuesArray = Array.isArray(queryValues) ? queryValues : [queryValues as string]
    valuesArray
      .filter(value => value !== valueToRemove) // Remove the selected value
      .forEach(value => newQuery.append(filterKey, value as string)) // Re-add remaining values
  }

  return `/applications?${newQuery.toString()}`
}
