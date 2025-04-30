import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsApiClient from './managingPrisonerAppsClient'

const testData = new TestData()

jest.mock('../../logger')

describe('ManagingPrisonerAppsApiClient', () => {
  let fakeManagingPrisonerAppApi: nock.Scope
  let client: ManagingPrisonerAppsApiClient

  const { app, appSearchPayload, appSearchResponse, response, submitPrisonerAppData, user } = testData

  beforeEach(() => {
    fakeManagingPrisonerAppApi = nock(config.apis.managingPrisonerApps.url)
    client = new ManagingPrisonerAppsApiClient(user.token)
  })

  afterEach(() => nock.cleanAll())

  it('should retrieve a specific prisoner application by prisoner and application ID', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id?requestedBy=true&assignedGroup=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, app)

    const output = await client.getPrisonerApp('prisoner-id', 'app-id')
    expect(output).toEqual(app)
  })

  it('should forward an application to another department', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/apps/app-id/forward/groups/group-id', { message: '' })
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, undefined)

    const output = await client.forwardApp('app-id', 'group-id')
    expect(output).toBeUndefined()
  })

  it('should submit a new prisoner application', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/G4567/apps')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(201, app)

    const output = await client.submitPrisonerApp(submitPrisonerAppData)
    expect(output).toEqual(app)
  })

  it('should search for applications based on payload', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/apps/search')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, appSearchResponse)

    const output = await client.getApps(appSearchPayload)
    expect(output).toEqual(appSearchResponse)
  })

  it('should add a response to an application', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/prisoner-id/apps/app-id/responses')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(201, undefined)

    const output = await client.addResponse('prisoner-id', 'app-id', {
      reason: '',
      decision: 'APPROVED',
      appliesTo: ['id'],
    })
    expect(output).toBeUndefined()
  })

  it('should fetch the response for an application', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id/responses/response-id?createdBy=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, response)

    const output = await client.getResponse('prisoner-id', 'app-id', 'response-id')
    expect(output).toEqual(response)
  })

  it('should update the form data for an application', async () => {
    const payload = [{ id: 'abc-123', key: 'value' }]

    fakeManagingPrisonerAppApi
      .put('/v1/prisoners/prisoner-id/apps/app-id')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, { ...app, requests: payload })

    const output = await client.changeApp('prisoner-id', 'app-id', payload)
    expect(output).toEqual({ ...app, requests: payload })
  })
})
