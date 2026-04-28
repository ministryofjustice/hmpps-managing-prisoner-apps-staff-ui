import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import PersonalRelationshipsApiClient from './personalRelationshipsApiClient'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'

jest.mock('../../logger')

describe('PersonalRelationshipsApiClient', () => {
  let fakeApi: nock.Scope
  let client: PersonalRelationshipsApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  const token = 'test-system-token'

  beforeEach(() => {
    fakeApi = nock(config.apis.personalRelationships.url)
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue(token),
    } as unknown as jest.Mocked<AuthenticationClient>

    client = new PersonalRelationshipsApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
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

    const result = await client.getRelationships(groupCode)

    expect(result).toEqual(mockResponse)
  })
})
