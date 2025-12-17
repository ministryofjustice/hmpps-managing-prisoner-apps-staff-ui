import { InmateDetail } from '../@types/prisonApi'
import { ParsedFilters } from '../utils/http/filters'

// eslint-disable-next-line import/prefer-default-export
export const validatePrisonerFilter = (filters: ParsedFilters, prisonerDetails: InmateDetail[]) => {
  if (!filters.prisonerId) return null

  const found = prisonerDetails.find(p => p && p.offenderNo === filters.prisonerId)

  if (!found) {
    return {
      message: 'Check your spelling or clear the search, then try again',
      summaryTitle: 'There is a problem',
    }
  }

  return null
}
