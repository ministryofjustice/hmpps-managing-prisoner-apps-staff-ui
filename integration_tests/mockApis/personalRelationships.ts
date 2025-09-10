import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubGetRelationships: (groupCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/personalRelationships/reference-codes/group/${groupCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },
}
