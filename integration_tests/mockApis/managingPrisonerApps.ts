import { SuperAgentRequest } from 'superagent'
import { Application } from '../../server/@types/managingAppsApi'
import TestData from '../../server/routes/testutils/testData'
import { stubFor } from './wiremock'

export default {
  stubGetPrisonerApp: ({ app }: { app: Application }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}?requestedBy=true&assignedGroup=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: app,
      },
    })
  },

  stubGetGroups: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/groups`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [new TestData().group],
      },
    })
  },

  stubGetAppResponse: ({ app }: { app: Application }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/responses/${app.requests[0].responseId}?createdBy=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: new TestData().response,
      },
    })
  },
}
