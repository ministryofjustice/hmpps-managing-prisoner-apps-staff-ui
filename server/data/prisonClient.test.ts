import nock from 'nock'
import config from '../config'
import PrisonApiClient from './prisonClient'
import { prisoner, user } from '../testData'

jest.mock('../../logger')

describe('Prison API Client', () => {
  let fakePrisonApi: nock.Scope
  let client: PrisonApiClient

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prison.url)
    client = new PrisonApiClient(user.token)
  })

  afterEach(() => nock.cleanAll())

  it('should return a response from the api', async () => {
    fakePrisonApi
      .get('/api/offenders/prisoner-id')
      .matchHeader('authorization', `Bearer ${user.token}`)
      .reply(200, prisoner)

    const output = await client.getPrisonerByPrisonNumber('prisoner-id')
    expect(output).toEqual(prisoner)
  })
})
