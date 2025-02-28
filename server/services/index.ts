import { dataAccess } from '../data'
import AuditService from './auditService'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'
import PrisonService from './prisonService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const managingPrisonerAppsService = new ManagingPrisonerAppsService(hmppsAuthClient)
  const prisonService = new PrisonService(hmppsAuthClient)

  return {
    applicationInfo,
    auditService,
    prisonService,
    managingPrisonerAppsService,
  }
}

export type Services = ReturnType<typeof services>
