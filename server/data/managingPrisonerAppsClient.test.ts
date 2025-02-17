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

  const application = testData.prisonerApp

  beforeEach(() => {
    fakeManagingPrisonerAppApi = nock(config.apis.managingPrisonerApps.url)
    client = new ManagingPrisonerAppsApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('getPrisonerApp should return data from api', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id')
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(200, application)

    const output = await client.getPrisonerApp('prisoner-id', 'app-id', token)
    expect(output).toEqual(application)
  })
})
