import HmppsAuthClient from '../data/hmppsAuthClient'
import TestData from '../routes/testutils/testData'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'

const mockClientMethods = {
  forwardApp: jest.fn(),
  getApps: jest.fn(),
  getGroups: jest.fn(),
  getPrisonerApp: jest.fn(),
}

const testData = new TestData()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/managingPrisonerAppsClient', () => {
  return jest.fn().mockImplementation(() => mockClientMethods)
})

describe('ManagingPrisonerAppsService', () => {
  let service: ManagingPrisonerAppsService

  const { appSearchPayload, app, user } = testData

  beforeEach(() => {
    const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(user.token)

    service = new ManagingPrisonerAppsService(hmppsAuthClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getPrisonerApp', () => {
    it('should retrieve a prisoner application using the client', async () => {
      mockClientMethods.getPrisonerApp.mockReturnValue(app)

      const result = await service.getPrisonerApp('prisoner-id', 'application-id', user)

      expect(result).toEqual(app)
      expect(mockClientMethods.getPrisonerApp).toHaveBeenCalledWith('prisoner-id', 'application-id')
    })
  })

  describe('forwardApp', () => {
    it('should forward an application to the specified group', async () => {
      const result = await service.forwardApp('application-id', 'group-id', user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.forwardApp).toHaveBeenCalledWith('application-id', 'group-id')
    })
  })

  describe('getApplications', () => {
    it('should fetch a list of applications based on search criteria', async () => {
      const result = await service.getApps(appSearchPayload, user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.getApps).toHaveBeenCalledWith(appSearchPayload)
    })
  })

  describe('getGroups', () => {
    it('should fetch a list of groups for the given establishment', async () => {
      const result = await service.getGroups(user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.getGroups).toHaveBeenCalledWith()
    })
  })
})
