import HmppsAuthClient from '../data/hmppsAuthClient'
import PersonalRelationshipsApiClient from '../data/personalRelationshipsClient'
import PersonalRelationshipsService from './personalRelationshipsService'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/personalRelationshipsClient')

describe('PersonalRelationshipsService', () => {
  let service: PersonalRelationshipsService
  const mockGetSystemClientToken = jest.fn()
  const mockRelationshipList = jest.fn()

  beforeEach(() => {
    const mockHmppsAuthClient = {
      getSystemClientToken: mockGetSystemClientToken,
    } as unknown as jest.Mocked<HmppsAuthClient>

    service = new PersonalRelationshipsService(mockHmppsAuthClient)
    ;(PersonalRelationshipsApiClient as jest.Mock).mockImplementation(() => ({
      relationshipList: mockRelationshipList,
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return filtered and mapped relationship list', async () => {
    mockGetSystemClientToken.mockResolvedValue('fake-token')

    const apiResponse = [
      { code: 'AUNT', description: 'Aunt', isActive: true },
      { code: 'PARENT', description: 'Parent', isActive: false },
      { code: 'BOF', description: 'Boyfriend', isActive: true },
    ]

    mockRelationshipList.mockResolvedValue(apiResponse)

    const result = await service.relationshipList('someGroupCode')

    expect(mockGetSystemClientToken).toHaveBeenCalled()
    expect(mockRelationshipList).toHaveBeenCalledWith('someGroupCode')
    expect(result).toEqual([
      { code: 'AUNT', description: 'Aunt' },
      { code: 'BOF', description: 'Boyfriend' },
    ])
  })

  it('should return an empty array if API client returns null', async () => {
    mockGetSystemClientToken.mockResolvedValue('fake-token')
    mockRelationshipList.mockResolvedValue(null)

    const result = await service.relationshipList('someGroupCode')

    expect(result).toEqual([])
  })
})
