import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import PrisonApiClient from './prisonApiClient'
import { prisoner } from '../testData'

jest.mock('../../logger')

describe('Prison API Client', () => {
  let fakePrisonApi: nock.Scope
  let client: PrisonApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  const token = 'test-system-token'

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue(token),
    } as unknown as jest.Mocked<AuthenticationClient>

    fakePrisonApi = nock(config.apis.prison.url)
    client = new PrisonApiClient(mockAuthenticationClient)
  })

  afterEach(() => nock.cleanAll())

  it('should return a response from the api', async () => {
    fakePrisonApi.get('/api/offenders/prisoner-id').matchHeader('authorization', `Bearer ${token}`).reply(200, prisoner)

    const output = await client.getPrisonerByPrisonNumber('username', 'prisoner-id')
    expect(output).toEqual(prisoner)
  })
})
