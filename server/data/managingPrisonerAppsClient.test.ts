import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsApiClient from './managingPrisonerAppsClient'

const testData = new TestData()

jest.mock('../../logger')

describe('ManagingPrisonerAppsApiClient', () => {
  let fakeManagingPrisonerAppApi: nock.Scope
  let client: ManagingPrisonerAppsApiClient

  const { appSearchPayload, appSearchResponse, prisonerApp, submitPrisonerAppData, user } = testData

  beforeEach(() => {
    fakeManagingPrisonerAppApi = nock(config.apis.managingPrisonerApps.url)
    client = new ManagingPrisonerAppsApiClient(user.token)
  })

  afterEach(() => nock.cleanAll())

  it('should retrieve a specific prisoner application by prisoner and application ID', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id?requestedBy=true&assignedGroup=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, prisonerApp)

    const output = await client.getPrisonerApp('prisoner-id', 'app-id')
    expect(output).toEqual(prisonerApp)
  })

  it('should forward an application to another department', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/apps/app-id/forward/groups/group-id')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, undefined)

    const output = await client.forwardApp('app-id', 'group-id')
    expect(output).toBeUndefined()
  })

  it('should submit a new prisoner application', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/G4567/apps')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(201, prisonerApp)

    const output = await client.submitPrisonerApp(submitPrisonerAppData)
    expect(output).toEqual(prisonerApp)
  })

  it('should search for applications based on payload', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/apps/search')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, appSearchResponse)

    const output = await client.getApps(appSearchPayload)
    expect(output).toEqual(appSearchResponse)
  })
})
