import { SuperAgentRequest } from 'superagent'
import jwt from 'jsonwebtoken'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'

const generateMockToken = () => {
  const payload = {
    user_name: 'user1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

export default {
  stubGetPrisonerByPrisonNumber: (prisonNumber = 'G3682UE'): SuperAgentRequest => {
    const token = generateMockToken()
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/prisoners/${prisonNumber}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [new TestData().prisoner],
      },
    })
  },
}
