import { dataAccess } from '../data'
import AuditService from './auditService'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient, managingPrisonerAppsApiClientBuilder } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const managingPrisonerAppsService = new ManagingPrisonerAppsService(
    hmppsAuthClient,
    managingPrisonerAppsApiClientBuilder,
  )

  return {
    applicationInfo,
    auditService,
    managingPrisonerAppsService,
  }
}

export type Services = ReturnType<typeof services>
