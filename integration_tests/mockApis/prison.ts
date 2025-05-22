import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'

export default {
  stubGetPrisonerByPrisonNumber: (prisonNumber): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/prisoners/${prisonNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [new TestData().prisoner],
      },
    })
  },
}
