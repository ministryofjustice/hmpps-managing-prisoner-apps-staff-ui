import { APPLICATION_STATUS } from '../constants/applicationStatus'
import HmppsAuthClient from '../data/hmppsAuthClient'
import { app, appSearchPayload, user } from '../testData'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'

const mockClientMethods = {
  addComment: jest.fn(),
  addResponse: jest.fn(),
  changeApp: jest.fn(),
  forwardApp: jest.fn(),
  getActiveAgencies: jest.fn(),
  getApps: jest.fn(),
  getComments: jest.fn(),
  getPrisonerApp: jest.fn(),
  getResponse: jest.fn(),
  getHistory: jest.fn(),
}

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/managingPrisonerAppsClient', () => {
  return jest.fn().mockImplementation(() => mockClientMethods)
})

describe('ManagingPrisonerAppsService', () => {
  let service: ManagingPrisonerAppsService

  beforeEach(() => {
    const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(user.token)

    service = new ManagingPrisonerAppsService(hmppsAuthClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getSupportedPrisonIds', () => {
    it('should fetch a list of active establishments/agencies', async () => {
      const result = await service.getSupportedPrisonIds(undefined)

      expect(result).toBeUndefined()
      expect(mockClientMethods.getActiveAgencies).toHaveBeenCalledWith()
    })
  })

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
      const result = await service.forwardApp('application-id', 'group-id', user, '')

      expect(result).toBeUndefined()
      expect(mockClientMethods.forwardApp).toHaveBeenCalledWith('application-id', 'group-id', '')
    })
  })

  describe('getApplications', () => {
    it('should fetch a list of applications based on search criteria', async () => {
      const result = await service.getApps(appSearchPayload, user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.getApps).toHaveBeenCalledWith(appSearchPayload)
    })
  })

  describe('addComment', () => {
    it('should add a comment to an application', async () => {
      const payload = {
        message: 'Test comment',
        targetUsers: [{ id: 'target-user-id' }],
      }

      const result = await service.addComment('prisoner-id', 'application-id', payload, user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.addComment).toHaveBeenCalledWith('prisoner-id', 'application-id', payload)
    })
  })

  describe('getComments', () => {
    it('should fetch the comments for an application', async () => {
      const result = await service.getComments('prisoner-id', 'application-id', user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.getComments).toHaveBeenCalledWith('prisoner-id', 'application-id')
    })
  })

  describe('addResponse', () => {
    it('should add a response to an application request', async () => {
      const payload = {
        reason: '',
        decision: APPLICATION_STATUS.APPROVED,
        appliesTo: ['id'],
      }

      const result = await service.addResponse('prisoner-id', 'application-id', payload, user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.addResponse).toHaveBeenCalledWith('prisoner-id', 'application-id', payload)
    })
  })

  describe('getResponse', () => {
    it('should fetch the response for an application request', async () => {
      const result = await service.getResponse('prisoner-id', 'application-id', 'response-id', user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.getResponse).toHaveBeenCalledWith('prisoner-id', 'application-id', 'response-id')
    })
  })

  describe('getHistory', () => {
    it('should fetch the history for an application', async () => {
      const result = await service.getHistory('prisoner-id', 'application-id', user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.getHistory).toHaveBeenCalledWith('prisoner-id', 'application-id')
    })
  })

  describe('changeApp', () => {
    it('should change the form data for an application', async () => {
      const payload = { firstNightCenter: true, formData: [{ id: 'abc-123', key: 'value' }] }
      const result = await service.changeApp('prisoner-id', 'application-id', payload, user)

      expect(result).toBeUndefined()
      expect(mockClientMethods.changeApp).toHaveBeenCalledWith('prisoner-id', 'application-id', payload)
    })
  })
})
