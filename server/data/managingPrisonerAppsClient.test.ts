import nock from 'nock'
import config from '../config'
import {
  app,
  appWithPhotos,
  appDecisionResponse,
  appHistoryResponse,
  appSearchPayload,
  appSearchResponse,
  submitPrisonerAppData,
  submitPrisonerAppDataWithPhotos,
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
    const response = appDecisionResponse({ decision: 'APPROVED' })
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/prisoner-id/apps/app-id/responses/response-id?createdBy=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, response)

    const output = await client.getResponse('prisoner-id', 'app-id', 'response-id')
    expect(output).toEqual(response)
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

  it('should retrieve a prisoner application with photos', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/G4567/apps/23d2c453-be11-44a8-9861-21fd8ae6e922?requestedBy=true&assignedGroup=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, appWithPhotos)

    const output = await client.getPrisonerApp('G4567', '23d2c453-be11-44a8-9861-21fd8ae6e922')

    expect(output).toEqual(appWithPhotos)
    expect(output.files).toHaveLength(2)
    expect(output.files[0].documentId).toBe('uuid-1234')
    expect(output.files[0].fileName).toBe('application-photo[photo1].jpg')
  })

  it('should handle the complete photo submission and retrieval flow', async () => {
    const prisonerId = 'G4567'
    const appId = '23d2c453-be11-44a8-9861-21fd8ae6e922'

    fakeManagingPrisonerAppApi
      .post(`/v1/prisoners/${prisonerId}/apps`, body => {
        expect(body.fileRequestDtos).toHaveLength(2)
        expect(body.requests[0].details).toBe('Testing photo details')
        return true
      })
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(201, appWithPhotos)

    const submittedApp = await client.submitPrisonerApp(submitPrisonerAppDataWithPhotos)

    expect(submittedApp.id).toBe(appId)
    expect(submittedApp.files).toHaveLength(2)

    fakeManagingPrisonerAppApi
      .get(`/v1/prisoners/${prisonerId}/apps/${appId}?requestedBy=true&assignedGroup=true`)
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, appWithPhotos)

    const retrievedApp = await client.getPrisonerApp(prisonerId, appId)
    expect(retrievedApp).toEqual(appWithPhotos)
    expect(retrievedApp.files).toHaveLength(2)
    expect(retrievedApp.files).toEqual(submittedApp.files)
  })

  it('should submit application without photos when fileRequestDtos is empty', async () => {
    const appDataNoPhotos = {
      ...submitPrisonerAppData,
      fileRequestDtos: [] as const,
    }

    const appWithoutFiles = { ...app }
    delete appWithoutFiles.files
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/G4567/apps', body => {
        expect(body.fileRequestDtos).toEqual([])
        return true
      })
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(201, appWithoutFiles)

    const output = await client.submitPrisonerApp(appDataNoPhotos)
    expect(output).toEqual(appWithoutFiles)
    expect(output.files).toBeUndefined()
  })

  it('should handle errors when submitting application with photos fails', async () => {
    fakeManagingPrisonerAppApi
      .post('/v1/prisoners/G4567/apps')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(500, { message: 'Internal server error' })

    const result = await client.submitPrisonerApp(submitPrisonerAppDataWithPhotos)
    expect(result).toBeNull()
  })

  it('should handle application with empty files array', async () => {
    const appWithEmptyFiles = {
      ...app,
      files: [] as const,
    }

    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/G4567/apps/app-id?requestedBy=true&assignedGroup=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, appWithEmptyFiles)

    const output = await client.getPrisonerApp('G4567', 'app-id')
    expect(output.files).toEqual([])
  })

  it('should handle application with different photo file types', async () => {
    const appWithDifferentFileTypes = {
      ...appWithPhotos,
      files: [
        {
          id: '1',
          documentId: 'uuid-1',
          fileName: 'photo1.jpg',
          fileType: 'image/jpeg',
          createdDate: '2026-02-26T15:32:11',
          createdBy: 'TEST_USER',
        },
        {
          id: '2',
          documentId: 'uuid-2',
          fileName: 'photo2.png',
          fileType: 'image/png',
          createdDate: '2026-02-26T15:32:12',
          createdBy: 'TEST_USER',
        },
      ],
    }

    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/G4567/apps/23d2c453-be11-44a8-9861-21fd8ae6e922?requestedBy=true&assignedGroup=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, appWithDifferentFileTypes)

    const output = await client.getPrisonerApp('G4567', '23d2c453-be11-44a8-9861-21fd8ae6e922')

    expect(output.files).toHaveLength(2)
    expect(output.files.map(f => f.fileType)).toEqual(['image/jpeg', 'image/png'])
  })

  it('should handle 404 when application with photos does not exist', async () => {
    fakeManagingPrisonerAppApi
      .get('/v1/prisoners/G4567/apps/non-existent-id?requestedBy=true&assignedGroup=true')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(404, { message: 'Application not found' })

    const result = await client.getPrisonerApp('G4567', 'non-existent-id')
    expect(result).toBeNull()
  })
})
