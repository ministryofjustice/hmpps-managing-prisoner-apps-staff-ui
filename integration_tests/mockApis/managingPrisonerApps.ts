import { SuperAgentRequest } from 'superagent'

import { App } from '../../server/@types/managingAppsApi'

import {
  appDecisionResponse,
  commentsResponse,
  appSearchResponse,
  buildAppsSearchResponse,
} from '../../server/testData'

import { appHistoryResponse } from '../../server/testData/applications/appHistory'
import { departments } from '../../server/testData/groups/departments'
import { groups } from '../../server/testData/groups/groups'

import { stubFor } from './wiremock'

export default {
  stubGetPrisonerApp: ({ app }: { app: App }): SuperAgentRequest => {
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
  stubSubmitPrisonerApp: ({ app }: { app: App }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: '/managingPrisonerApps/v1/prisoners/.*/apps',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: app,
      },
    })
  },
  stubUpdatePrisonerApp: ({ app }: { app: App }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: app,
      },
    })
  },
  stubGetAppResponse: ({
    app,
    decision = 'APPROVED',
    reason = '',
  }: {
    app: App
    decision?: 'APPROVED' | 'DECLINED'
    reason?: string
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/responses/${app.requests[0].responseId}?createdBy=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: appDecisionResponse({ decision, reason }),
      },
    })
  },
  stubAddAppResponse: ({
    app,
    decision = 'APPROVED',
    reason = '',
  }: {
    app: App
    decision?: 'APPROVED' | 'DECLINED'
    reason?: string
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/responses`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: appDecisionResponse({ decision, reason }),
      },
    })
  },
  stubGetComments: ({ app }: { app: App }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/comments?page=1&size=20&createdBy=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: commentsResponse,
      },
    })
  },
  stubAddComments: ({ app }: { app: App }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/comments`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: commentsResponse,
      },
    })
  },
  stubGetHistory: ({ app }: { app: App }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/applications/${app.requestedBy.username}/apps/${app.id}/history`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: appHistoryResponse,
      },
    })
  },
  stubGetActiveAgencies: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/managingPrisonerApps/v1/establishments',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: ['HEI', 'BLI'],
      },
    })
  },
  stubGetActiveAgenciesError: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/managingPrisonerApps/v1/establishments',
      },
      response: {
        status: 500,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },
  stubGetDepartments: ({ appType }: { appType: number }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/groups/app/types/${appType.toString()}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: departments,
      },
    })
  },
  stubOfficialAppTypeWithCompanyField: (): SuperAgentRequest => {
    const officialApp = {
      id: 'official-app-id',
      status: 'PENDING',
      requestedBy: { username: 'A1234AA' },
      appType: 'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT',
      applicationType: {
        id: 2,
        name: 'Add an official PIN phone contact',
      },
      firstNightCenter: false,
      createdDate: '2024-12-01T00:00:00Z',
      requests: [
        {
          id: 'req-official-001',
          firstName: 'John',
          lastName: 'Doe',
          company: 'Legacy Company Ltd',
          telephone1: '07700900000',
          telephone2: '',
          relationship: 'Solicitor',
        },
      ],
    }
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${officialApp.requestedBy.username}/apps/${officialApp.id}?requestedBy=true&assignedGroup=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: officialApp,
      },
    })
  },
  stubGetGroupsAndTypes: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v2/establishments/apps/groups`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: groups,
      },
    })
  },
  stubGetApps: (
    filteredAppsOrResponse?: typeof appSearchResponse | typeof appSearchResponse.apps,
  ): SuperAgentRequest => {
    const response = buildAppsSearchResponse(filteredAppsOrResponse)
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: '/managingPrisonerApps/v1/prisoners/apps/search.*',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
      },
    })
  },
}
