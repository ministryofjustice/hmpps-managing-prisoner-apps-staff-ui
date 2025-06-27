import nock from 'nock'
import config from '../config'
import PersonalRelationshipsApiClient from './personalRelationshipsClient'

jest.mock('../../logger')

describe('PersonalRelationshipsApiClient', () => {
  let fakeApi: nock.Scope
  let client: PersonalRelationshipsApiClient
  const token = 'some-auth-token'

  beforeEach(() => {
    fakeApi = nock(config.apis.personalRelationships.url)
    client = new PersonalRelationshipsApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should return relationship list from the api', async () => {
    const groupCode = 'SOCIAL_RELATIONSHIPS'
    const mockResponse = [
      { code: 'AUNT', description: 'Aunt' },
      { code: 'UNCLE', description: 'Uncle' },
    ]

    fakeApi
      .get(`/reference-codes/group/${groupCode}`)
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(200, mockResponse)

    const result = await client.getRelationshipList(groupCode)

    expect(result).toEqual(mockResponse)
  })
})
