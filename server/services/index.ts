import { dataAccess } from '../data'
import AuditService from './auditService'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'
import PrisonService from './prisonService'
import PersonalRelationshipsService from './personalRelationshipsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const managingPrisonerAppsService = new ManagingPrisonerAppsService(hmppsAuthClient)
  const prisonService = new PrisonService(hmppsAuthClient)
  const personalRelationshipsService = new PersonalRelationshipsService(hmppsAuthClient)

  return {
    applicationInfo,
    auditService,
    prisonService,
    managingPrisonerAppsService,
    personalRelationshipsService,
  }
}

export type Services = ReturnType<typeof services>
