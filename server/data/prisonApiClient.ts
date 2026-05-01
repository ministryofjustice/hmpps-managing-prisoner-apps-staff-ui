import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CaseLoad from '@ministryofjustice/hmpps-connect-dps-components/dist/types/CaseLoad'
import logger from '../../logger'
import { InmateDetail } from '../@types/prisonApi'
import config from '../config'

export default class PrisonApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('prisonApiClient', config.apis.prison, logger, authenticationClient)
  }

  async getPrisonerByPrisonNumber(username: string, prisonerNumber: string): Promise<InmateDetail | null> {
    try {
      return await this.get(
        {
          path: `/api/offenders/${prisonerNumber}`,
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching prisoner`, error)
      return null
    }
  }

  async getCurrentUserCaseloads(username: string): Promise<CaseLoad[]> {
    try {
      return await this.get<CaseLoad[]>(
        {
          path: '/api/users/me/caseLoads',
        },
        asSystem(username),
      )
    } catch (error) {
      logger.error(`Error fetching caseloads for user ${username}`, error)
      return null
    }
  }
}
