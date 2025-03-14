import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsApiClient from './managingPrisonerAppsClient'

const testData = new TestData()

jest.mock('../../logger')

describe('Managing Prisoner Apps API Client', () => {
  let fakeManagingPrisonerAppApi: nock.Scope
  let client: ManagingPrisonerAppsApiClient

  const { prisonerApp, user, submitPrisonerAppData } = testData

  beforeEach(() => {
    fakeManagingPrisonerAppApi = nock(config.apis.managingPrisonerApps.url)
    client = new ManagingPrisonerAppsApiClient(user.token)
  })

  afterEach(() => nock.cleanAll())

  it('should fetch a prisoner application by prisoner and application ID', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id?requestedBy=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, prisonerApp)

    const output = await client.getPrisonerApp('prisoner-id', 'app-id')
    expect(output).toEqual(prisonerApp)
  })

  // Reinstate with correct api endpoint and implementation once it is available
  // it('should successfully forward an application to a different department', async () => {
  //   fakeManagingPrisonerAppApi
  //     .get('/v1/')
  //     .matchHeader('authorization', `Bearer ${user.token}`)
  //     .reply(200, undefined)

  //   const output = await client.forwardApp('prisoner-id', 'app-id', 'dept')
  //   expect(output).toBeUndefined()
  // })

  it('should submit a prisoner application', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/G4567/apps/')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(201, prisonerApp)

    const output = await client.submitPrisonerApp(submitPrisonerAppData)
    expect(output).toEqual(prisonerApp)
  })
})
