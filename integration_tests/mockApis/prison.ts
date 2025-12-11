import { SuperAgentRequest } from 'superagent'
import { prisoner } from '../../server/testData'
import { stubFor } from './wiremock'

export default {
  stubGetPrisonerByPrisonerNumber: (prisonerNumber: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/offenders/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisoner,
      },
    })
  },
}
