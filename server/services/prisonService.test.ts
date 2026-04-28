import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { prisoner } from '../testData'
import PrisonService from './prisonService'
import PrisonApiClient from '../data/prisonApiClient'

jest.mock('../data/prisonApiClient')

describe('Prison Service', () => {
  const mockClient = new PrisonApiClient({} as AuthenticationClient) as jest.Mocked<PrisonApiClient>
  let service: PrisonService

  beforeEach(() => {
    service = new PrisonService(mockClient)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getPrisonerByPrisonNumber', () => {
    it('should call the client and fetch the prisoner application', async () => {
      mockClient.getPrisonerByPrisonNumber.mockResolvedValue(prisoner)

      const result = await service.getPrisonerByPrisonNumber('prisoner-id')

      expect(result).toEqual(prisoner)
      expect(mockClient.getPrisonerByPrisonNumber).toHaveBeenCalledWith('prisoner-id')
    })
  })
})
