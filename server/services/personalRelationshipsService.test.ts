import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import PersonalRelationshipsApiClient from '../data/personalRelationshipsApiClient'
import PersonalRelationshipsService from './personalRelationshipsService'

jest.mock('../data/personalRelationshipsApiClient')

describe('PersonalRelationshipsService', () => {
  const mockClient = new PersonalRelationshipsApiClient(
    {} as AuthenticationClient,
  ) as jest.Mocked<PersonalRelationshipsApiClient>
  let service: PersonalRelationshipsService

  beforeEach(() => {
    service = new PersonalRelationshipsService(mockClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return filtered and mapped relationship list', async () => {
    const apiResponse = [
      { code: 'AUNT', description: 'Aunt', isActive: true },
      { code: 'PARENT', description: 'Parent', isActive: false },
      { code: 'BOF', description: 'Boyfriend', isActive: true },
    ]

    // @ts-expect-error - we're only interested in testing the service's handling of the API response, not the client's implementation
    mockClient.getRelationships.mockResolvedValue(apiResponse)

    const result = await service.getRelationships('someGroupCode')

    expect(mockClient.getRelationships).toHaveBeenCalledWith('someGroupCode')
    expect(result).toEqual([
      { code: 'AUNT', description: 'Aunt', isActive: true },
      {
        code: 'PARENT',
        description: 'Parent',
        isActive: false,
      },
      { code: 'BOF', description: 'Boyfriend', isActive: true },
    ])
  })

  it('should return an empty array if API client returns null', async () => {
    mockClient.getRelationships.mockResolvedValue(null)

    const result = await service.getRelationships('someGroupCode')

    expect(result).toEqual([])
  })
})
