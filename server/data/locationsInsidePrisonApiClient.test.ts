import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { ResidentialLocation } from '../@types/locationsInsidePrisonApi'
import config from '../config'
import LocationsInsidePrisonApiClient from './locationsInsidePrisonApiClient'

jest.mock('../../logger')

describe('LocationsInsidePrisonApiClient', () => {
  let fakeApi: nock.Scope
  let client: LocationsInsidePrisonApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    fakeApi = nock(config.apis.locationsInsidePrison.url)
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    client = new LocationsInsidePrisonApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  it('fetches the residential hierarchy for a prison', async () => {
    const hierarchy: ResidentialLocation[] = [
      {
        locationId: 'wing-a',
        locationType: 'WING',
        locationCode: 'A',
        fullLocationPath: 'A',
        level: 1,
        status: 'ACTIVE',
        subLocations: [],
      },
    ]

    fakeApi
      .get('/locations/prison/LEI/residential-hierarchy')
      .query({ maxLevel: '2', includeVirtualLocations: 'false', includeInactive: 'false' })
      .matchHeader('authorization', 'Bearer test-system-token')
      .reply(200, hierarchy)

    await expect(client.getResidentialHierarchy('LEI')).resolves.toEqual(hierarchy)
  })
})
