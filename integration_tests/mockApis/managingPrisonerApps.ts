import { SuperAgentRequest } from 'superagent'
import { Application } from '../../server/@types/managingAppsApi'
import { stubFor } from './wiremock'

export default {
  stubGetPrisonerApp: ({
    prisonerId,
    applicationId,
    application,
  }: {
    prisonerId: string
    applicationId: string
    application: Application
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${prisonerId}/apps/${applicationId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: application,
      },
    })
  },
}
