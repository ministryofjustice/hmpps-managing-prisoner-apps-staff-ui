import nock from 'nock'
import config from '../config'
import PersonalRelationshipsApiClient from './personalRelationshipsClient'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'

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
    const groupCode = PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP
    const mockResponse = [
      { code: 'AUNT', description: 'Aunt' },
      { code: 'UNCLE', description: 'Uncle' },
    ]

    fakeApi
      .get(`/reference-codes/group/${groupCode}`)
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(200, mockResponse)

    const result = await client.relationshipList(groupCode)

    expect(result).toEqual(mockResponse)
  })
})
