import { expect } from '@playwright/test'
import { App, ApplicationSearchPayload, ViewAppListApp } from '../../server/@types/managingAppsApi'
import { appSearchResponse, buildAppsSearchResponse } from '../../server/testData'
import { filterApplication, filterLocations } from '../fixtures/applicationFilters'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { getMatchingRequests, resetStubs, stubFor } from '../mockApis/wiremock'

const searchPath = '/managingPrisonerApps/v1/prisoners/apps/search'

const searchRequest = (payload: Partial<ApplicationSearchPayload>, exact = false) => ({
  method: 'POST',
  urlPath: searchPath,
  bodyPatterns: [{ equalToJson: JSON.stringify(payload), ignoreExtraElements: !exact }],
})

export const stubFilteredApps = (
  payload: Partial<ApplicationSearchPayload>,
  apps: ViewAppListApp[] = [filterApplication],
) =>
  stubFor({
    priority: 1,
    request: searchRequest(payload),
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: buildAppsSearchResponse(apps),
    },
  })

export const expectSearch = async (payload: Partial<ApplicationSearchPayload>, exact = false): Promise<void> => {
  const { body } = await getMatchingRequests(searchRequest(payload, exact))
  expect(body.requests).not.toHaveLength(0)
}

export const stubFilteredAppDetails = async (application: App): Promise<void> => {
  await managingPrisonerAppsApi.stubGetPrisonerApp({ app: application })
  await managingPrisonerAppsApi.stubGetDepartments({ appType: application.applicationType.id })
  await prisonApi.stubGetPrisonerByPrisonerNumber(application.requestedBy.username)
}

export const setupApplicationsFilterMocks = async (): Promise<void> => {
  await resetStubs()
  await auth.stubSignIn()
  await prisonApi.stubGetCaseLoads('HMI')
  await prisonApi.stubGetPrisonerByPrisonerNumber('A12345')
  await managingPrisonerAppsApi.stubGetGroupsAndTypes()
  await managingPrisonerAppsApi.stubGetActiveAgencies()
  await managingPrisonerAppsApi.stubGetApps(appSearchResponse)
  await stubFor({
    request: {
      method: 'GET',
      urlPath: '/locationsInsidePrison/locations/prison/HMI/residential-hierarchy',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: filterLocations,
    },
  })
}
