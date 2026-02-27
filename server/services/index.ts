import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { dataAccess } from '../data'
import logger from '../../logger'
import AuditService from './auditService'
import ManagingPrisonerAppsService from './managingPrisonerAppsService'
import DocumentManagementService from './documentManagementService'
import PrisonService from './prisonService'
import PersonalRelationshipsService from './personalRelationshipsService'

export const services = () => {
  const { applicationInfo, hmppsAuthClient, osPlacesApiClient } = dataAccess()

  const auditService = new AuditService()
  const managingPrisonerAppsService = new ManagingPrisonerAppsService(hmppsAuthClient)
  const documentManagementService = new DocumentManagementService(hmppsAuthClient)
  const prisonService = new PrisonService(hmppsAuthClient)
  const personalRelationshipsService = new PersonalRelationshipsService(hmppsAuthClient)
  const osPlacesAddressService = new OsPlacesAddressService(logger, osPlacesApiClient)

  return {
    applicationInfo,
    auditService,
    documentManagementService,
    prisonService,
    managingPrisonerAppsService,
    personalRelationshipsService,
    osPlacesAddressService,
  }
}

export type Services = ReturnType<typeof services>
