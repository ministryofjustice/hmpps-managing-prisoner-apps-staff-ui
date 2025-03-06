import HmppsAuthClient from '../data/hmppsAuthClient'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'

const getPrisonerApp = jest.fn()
const forwardApp = jest.fn()

const testData = new TestData()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/managingPrisonerAppsClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerApp, forwardApp }
  })
})

describe('Managing Prisoner Apps Service', () => {
  let service: ManagingPrisonerAppsService

  const { prisonerApp, user } = testData

  beforeEach(() => {
    const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(user.token)

    service = new ManagingPrisonerAppsService(hmppsAuthClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getPrisonerApp', () => {
    it('should call the client and fetch the prisoner application', async () => {
      getPrisonerApp.mockReturnValue(prisonerApp)

      const result = await service.getPrisonerApp('prisoner-id', 'application-id', user)

      expect(result).toEqual(prisonerApp)
      expect(getPrisonerApp).toHaveBeenCalledWith('prisoner-id', 'application-id')
    })
  })

  describe('forwardApp', () => {
    it('should call the client and fetch the prisoner application', async () => {
      const result = await service.forwardApp('prisoner-id', 'application-id', 'dept', user)

      expect(result).toBeUndefined()
      expect(forwardApp).toHaveBeenCalledWith('prisoner-id', 'application-id', 'dept')
    })
  })
})
