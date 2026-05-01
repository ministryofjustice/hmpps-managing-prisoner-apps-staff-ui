import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { APPLICATION_STATUS } from '../constants/applicationStatus'
import { app, appSearchPayload, user } from '../testData'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'
import ManagingPrisonerAppsApiClient from '../data/managingPrisonerAppsApiClient'

jest.mock('../data/managingPrisonerAppsApiClient')

describe('ManagingPrisonerAppsService', () => {
  const mockClient = new ManagingPrisonerAppsApiClient(
    {} as AuthenticationClient,
  ) as jest.Mocked<ManagingPrisonerAppsApiClient>
  let service: ManagingPrisonerAppsService

  beforeEach(() => {
    service = new ManagingPrisonerAppsService(mockClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getSupportedPrisonIds', () => {
    it('should fetch a list of active establishments/agencies', async () => {
      const result = await service.getActiveAgencies()

      expect(result).toBeUndefined()
      expect(mockClient.getActiveAgencies).toHaveBeenCalledWith()
    })
  })

  describe('getPrisonerApp', () => {
    it('should retrieve a prisoner application using the client', async () => {
      mockClient.getPrisonerApp.mockResolvedValue(app)

      const result = await service.getPrisonerApp('prisoner-id', 'application-id', user)

      expect(result).toEqual(app)
      expect(mockClient.getPrisonerApp).toHaveBeenCalledWith(user.username, 'prisoner-id', 'application-id')
    })
  })

  describe('forwardApp', () => {
    it('should forward an application to the specified group', async () => {
      const result = await service.forwardApp('application-id', 'group-id', user, '')

      expect(result).toBeUndefined()
      expect(mockClient.forwardApp).toHaveBeenCalledWith(user.username, 'application-id', 'group-id', '')
    })
  })

  describe('getApplications', () => {
    it('should fetch a list of applications based on search criteria', async () => {
      const result = await service.getApps(appSearchPayload, user)

      expect(result).toBeUndefined()
      expect(mockClient.getApps).toHaveBeenCalledWith(user.username, appSearchPayload)
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
      expect(mockClient.addComment).toHaveBeenCalledWith(user.username, 'prisoner-id', 'application-id', payload)
    })
  })

  describe('getComments', () => {
    it('should fetch the comments for an application', async () => {
      const result = await service.getComments('prisoner-id', 'application-id', user)

      expect(result).toBeUndefined()
      expect(mockClient.getComments).toHaveBeenCalledWith(user.username, 'prisoner-id', 'application-id')
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
      expect(mockClient.addResponse).toHaveBeenCalledWith(user.username, 'prisoner-id', 'application-id', payload)
    })
  })

  describe('getResponse', () => {
    it('should fetch the response for an application request', async () => {
      const result = await service.getResponse('prisoner-id', 'application-id', 'response-id', user)

      expect(result).toBeUndefined()
      expect(mockClient.getResponse).toHaveBeenCalledWith(user.username, 'prisoner-id', 'application-id', 'response-id')
    })
  })

  describe('getHistory', () => {
    it('should fetch the history for an application', async () => {
      const result = await service.getHistory('prisoner-id', 'application-id', user)

      expect(result).toBeUndefined()
      expect(mockClient.getHistory).toHaveBeenCalledWith(user.username, 'prisoner-id', 'application-id')
    })
  })

  describe('changeApp', () => {
    it('should change the form data for an application', async () => {
      const payload = { firstNightCenter: true, formData: [{ id: 'abc-123', key: 'value' }] }
      const result = await service.changeApp('prisoner-id', 'application-id', payload, user)

      expect(result).toBeUndefined()
      expect(mockClient.changeApp).toHaveBeenCalledWith(user.username, 'prisoner-id', 'application-id', payload)
    })
  })
})
