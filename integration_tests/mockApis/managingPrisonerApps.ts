import { SuperAgentRequest } from 'superagent'
import { Application } from '../../server/@types/managingAppsApi'
import { stubFor } from './wiremock'

export default {
  stubGetPrisonerApp: ({
    prisonerId = 'A123456',
    applicationId = 'application-id',
    response,
  }: {
    prisonerId: string
    applicationId: string
    response: Application
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/v1/prisoners/${prisonerId}/apps/${applicationId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
      },
    }),
}
