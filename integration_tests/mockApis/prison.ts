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
  stubGetCaseLoads: (activeCaseLoadId = 'HMI', priority = 5): SuperAgentRequest => {
    return stubFor({
      priority,
      request: {
        method: 'GET',
        url: '/prison/api/users/me/caseLoads',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            caseLoadId: activeCaseLoadId,
            description: 'Test caseload',
            type: 'INST',
            caseloadFunction: 'GENERAL',
            currentlyActive: true,
          },
        ],
      },
    })
  },
}
