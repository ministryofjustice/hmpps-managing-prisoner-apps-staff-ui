import { dataAccess } from '../data'
import AuditService from './auditService'
import PrisonService from './prisonService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient, prisonApiClientBuilder } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const prisonService = new PrisonService(hmppsAuthClient, prisonApiClientBuilder)

  return {
    applicationInfo,
    auditService,
    prisonService,
  }
}

export type Services = ReturnType<typeof services>
