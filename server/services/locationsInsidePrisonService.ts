import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'

export default class LocationsInsidePrisonService {
  constructor(private readonly locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient) {}

  async getResidentialHierarchy(prisonId: string) {
    return this.locationsInsidePrisonApiClient.getResidentialHierarchy(prisonId)
  }
}
