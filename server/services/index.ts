import { dataAccess } from '../data'
import AuditService from './auditService'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const managingPrisonerAppsService = new ManagingPrisonerAppsService(hmppsAuthClient)

  return {
    applicationInfo,
    auditService,
    managingPrisonerAppsService,
  }
}

export type Services = ReturnType<typeof services>
