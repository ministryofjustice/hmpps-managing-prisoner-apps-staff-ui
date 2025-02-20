import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsApiClient from './managingPrisonerAppsClient'

const testData = new TestData()

jest.mock('../../logger')

describe('Managing Prisoner Apps API Client', () => {
  let fakeManagingPrisonerAppApi: nock.Scope
  let client: ManagingPrisonerAppsApiClient

  const token = 'token-1'

  const prisonerId = 'prisoner-id'

  const application = testData.prisonerApp

  const { submitPrisonerAppData } = testData

  beforeEach(() => {
    fakeManagingPrisonerAppApi = nock(config.apis.managingPrisonerApps.url)
    client = new ManagingPrisonerAppsApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })
  it('getAdjudicationLocations should return data from api', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id')
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(200, application)

    const output = await client.getPrisonerApp('app-id', 'prisoner-id')
    expect(output).toEqual(application)
  })

  it('should send data to api and return response', async () => {
    const requestData = submitPrisonerAppData

    fakeManagingPrisonerAppApi
      .post(`/v1/prisoners/${prisonerId}/apps`, requestData)
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(201, submitPrisonerAppData)

    const output = await client.submitPrisonerApp(prisonerId, requestData)
    expect(output).toEqual(submitPrisonerAppData)
  })
})
