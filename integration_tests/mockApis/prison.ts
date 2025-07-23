import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubGetPrisonerByPrisonNumber: (prisonerNumber): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/offenders/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },
}
