import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { dataAccess } from '../data'
import logger from '../../logger'
import AuditService from './auditService'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'
import DocumentManagementService from './documentManagementService'
import PrisonService from './prisonService'
import PersonalRelationshipsService from './personalRelationshipsService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    documentManagementApiClient,
    managingPrisonerAppsApiClient,
    personalRelationshipsApiClient,
    prisonApiClient,
    osPlacesApiClient,
  } = dataAccess()
  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    documentManagementService: new DocumentManagementService(documentManagementApiClient),
    prisonService: new PrisonService(prisonApiClient),
    managingPrisonerAppsService: new ManagingPrisonerAppsService(managingPrisonerAppsApiClient),
    personalRelationshipsService: new PersonalRelationshipsService(personalRelationshipsApiClient),
    osPlacesAddressService: new OsPlacesAddressService(logger, osPlacesApiClient),
  }
}

export type Services = ReturnType<typeof services>
