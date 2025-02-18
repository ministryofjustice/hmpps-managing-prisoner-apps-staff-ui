import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsApiClient from './managingPrisonerAppsClient'

const testData = new TestData()

jest.mock('../../logger')

describe('Managing Prisoner Apps API Client', () => {
  let fakeManagingPrisonerAppApi: nock.Scope
  let client: ManagingPrisonerAppsApiClient

  const { prisonerApp, user } = testData

  beforeEach(() => {
    fakeManagingPrisonerAppApi = nock(config.apis.managingPrisonerApps.url)
    client = new ManagingPrisonerAppsApiClient(user.token)
  })

  afterEach(() => nock.cleanAll())

  it('should return a response from the api', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, prisonerApp)

    const output = await client.getPrisonerApp('prisoner-id', 'app-id', user.token)
    expect(output).toEqual(prisonerApp)
  })
})
