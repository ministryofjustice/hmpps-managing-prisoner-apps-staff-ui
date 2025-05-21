import { SuperAgentRequest } from 'superagent'
import TestData from '../../server/routes/testutils/testData'
import { stubFor } from './wiremock'

export default {
  stubGetPrisonerByPrisonNumber: (prisonNumber = 'G3682UE'): SuperAgentRequest => {
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
