import HmppsAuthClient from '../data/hmppsAuthClient'
import TestData from '../routes/testutils/testData'
import PrisonService from './prisonService'

const getPrisonerByPrisonNumber = jest.fn()

const testData = new TestData()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerByPrisonNumber }
  })
})

describe('Prison Service', () => {
  let service: PrisonService

  const { prisoner, user } = testData

  beforeEach(() => {
    const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(user.token)

    service = new PrisonService(hmppsAuthClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getPrisonerByPrisonNumber', () => {
    it('should call the client and fetch the prisoner application', async () => {
      getPrisonerByPrisonNumber.mockReturnValue(prisoner)

      const result = await service.getPrisonerByPrisonNumber('prisoner-id', user)

      expect(result).toEqual(prisoner)
      expect(getPrisonerByPrisonNumber).toHaveBeenCalledWith('prisoner-id')
    })
  })
})
