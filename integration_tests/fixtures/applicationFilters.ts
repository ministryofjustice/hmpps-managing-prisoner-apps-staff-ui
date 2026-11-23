import { App, ViewAppListApp } from '../../server/@types/managingAppsApi'
import { app, appListAssignedGroups, appSearchResponse } from '../../server/testData'

export const filterApplication = appSearchResponse.apps[0]
export const businessHubId = appListAssignedGroups[0].id
export const omuId = appListAssignedGroups[2].id

export const filterPrisoner = {
  prisonerId: 'A1234AA',
  firstName: 'John',
  lastName: 'Smith',
}

export const filterLocations = [
  {
    locationId: 'wing-a',
    fullLocationPath: 'A',
    locationType: 'WING',
    status: 'ACTIVE',
    subLocations: [],
  },
  {
    locationId: 'wing-b',
    fullLocationPath: 'B',
    locationType: 'WING',
    status: 'ACTIVE',
    subLocations: [],
  },
]

export const filteredDetailListApp: ViewAppListApp = {
  ...appSearchResponse.apps[1],
  requestedBy: filterPrisoner.prisonerId,
  requestedByFirstName: filterPrisoner.firstName,
  requestedByLastName: filterPrisoner.lastName,
  assignedGroup: { ...appSearchResponse.apps[1].assignedGroup, id: businessHubId },
}

export const detailForListApp = (listApp: ViewAppListApp, cellLocation = 'A-1-123'): App => {
  const { status } = listApp
  if (
    status !== 'NEW' &&
    status !== 'IN_PROGRESS' &&
    status !== 'APPROVED' &&
    status !== 'DECLINED' &&
    status !== 'REJECTED'
  ) {
    throw new Error(`Unsupported application status: ${status}`)
  }

  return {
    ...app,
    id: listApp.id,
    status,
    createdDate: listApp.createdDate,
    applicationType: listApp.appType,
    assignedGroup: listApp.assignedGroup,
    requestedByFirstName: listApp.requestedByFirstName,
    requestedByLastName: listApp.requestedByLastName,
    requestedBy: {
      ...app.requestedBy,
      username: listApp.requestedBy,
      firstName: listApp.requestedByFirstName,
      lastName: listApp.requestedByLastName,
      cellLocation,
    },
    firstNightCenter: true,
  }
}
