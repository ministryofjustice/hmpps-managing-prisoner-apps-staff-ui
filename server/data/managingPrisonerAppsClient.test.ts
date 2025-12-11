import nock from 'nock'
import config from '../config'
import {
  app,
  appDecisionResponse,
  appHistoryResponse,
  appSearchPayload,
  appSearchResponse,
  submitPrisonerAppData,
  user,
} from '../testData'
import ManagingPrisonerAppsApiClient from './managingPrisonerAppsClient'

jest.mock('../../logger')

describe('ManagingPrisonerAppsApiClient', () => {
  let fakeManagingPrisonerAppApi: nock.Scope
  let client: ManagingPrisonerAppsApiClient

  beforeEach(() => {
    fakeManagingPrisonerAppApi = nock(config.apis.managingPrisonerApps.url)
    client = new ManagingPrisonerAppsApiClient(user.token)
  })

  afterEach(() => nock.cleanAll())

  it('should fetch the active establishments/agencies', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/establishments')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, ['CKI'])

    const output = await client.getActiveAgencies()
    expect(output).toEqual(['CKI'])
  })

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
      .reply(200, appDecisionResponse)

    const output = await client.getResponse('prisoner-id', 'app-id', 'response-id')
    expect(output).toEqual(appDecisionResponse)
  })

  it('should update the form data for an application', async () => {
    const formData = [{ id: 'abc-123', key: 'value' }]
    const payload = { firstNightCenter: true, formData }

    fakeManagingPrisonerAppApi
      .put('/v1/prisoners/prisoner-id/apps/app-id')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, { ...app, requests: payload })

    const output = await client.changeApp('prisoner-id', 'app-id', payload)
    expect(output).toEqual({ ...app, requests: payload })
  })

  it('should fetch the history for an application', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id/history')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, appHistoryResponse)

    const output = await client.getHistory('prisoner-id', 'app-id')
    expect(output).toEqual(appHistoryResponse)
  })
})
