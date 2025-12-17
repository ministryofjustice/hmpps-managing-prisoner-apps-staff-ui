import { ApplicationSearchPayload, ViewAppListAssignedGroup, ViewAppsListResponse } from '../../@types/managingAppsApi'

export const appListAssignedGroups: ViewAppListAssignedGroup[] = [
  {
    id: '343a7876-07b9-4ef8-947c-7cf554fae864',
    name: 'Business Hub',
    count: 10,
  },
  {
    id: '2262b27d-ad93-43e2-98f9-542297135eb3',
    name: 'Chaplaincy',
    count: 0,
  },
  {
    id: '1ebf7110-82cf-4dc1-b872-92c7d71847fc',
    name: 'OMU',
    count: 10,
  },
  {
    id: '3db3fb1a-a542-419b-99e2-3d24009293b8',
    name: 'Safer Custody',
    count: 0,
  },
  {
    id: 'e9515b3e-8ad1-4029-b4fb-ac9a2474db34',
    name: 'Security',
    count: 0,
  },
]

export const appSearchResponse: ViewAppsListResponse = {
  page: 1,
  totalRecords: 3,
  exhausted: true,
  applicationTypes: {
    '1': { id: 3, name: 'Add a social PIN phone contact', count: 1 },
    '2': { id: 2, name: 'Add an official PIN phone contact', count: 0 },
    '3': { id: 5, name: 'Swap Visiting Orders (VOs) for PIN Credit', count: 2 },
  },
  assignedGroups: appListAssignedGroups,
  firstNightCenter: 3,
  apps: [
    {
      id: '1808f5e2-2bf4-499a-b79f-fb0a5f4bac7b',
      establishmentId: 'TEST_ESTABLISHMENT_FIRST',
      status: 'PENDING',
      appType: { id: 5, name: 'Swap Visiting Orders (VOs) for PIN Credit' },
      requestedBy: 'A12345',
      requestedByFirstName: 'John',
      requestedByLastName: 'Smith',
      createdDate: '2025-03-24T14:03:13Z',
      genericForm: false,
      assignedGroup: {
        id: '60d7303f-f6e5-4ffd-8ef1-769a52d00983',
        name: 'Business Hub',
        establishment: {
          id: 'TEST_ESTABLISHMENT_FIRST',
          name: 'ESTABLISHMENT_NAME_1',
          appTypes: [
            'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
            'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT',
            'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
            'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
            'PIN_PHONE_REMOVE_CONTACT',
            'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
          ],
          defaultDepartments: false,
          blacklistedAppGroups: [],
          blacklistedAppTypes: [],
        },
        initialApp: 2,
        type: 'DEPARTMENT',
      },
    },
    {
      id: '53a02b48-b6af-47d5-9c54-3d0137f6ed96',
      establishmentId: 'TEST_ESTABLISHMENT_FIRST',
      status: 'PENDING',
      appType: { id: 3, name: 'Add a social PIN phone contact' },
      requestedBy: 'A12345',
      requestedByFirstName: 'John',
      requestedByLastName: 'Smith',
      createdDate: '2025-03-23T14:03:13Z',
      genericForm: false,
      assignedGroup: {
        id: '60d7303f-f6e5-4ffd-8ef1-769a52d00983',
        name: 'Business Hub',
        establishment: {
          id: 'TEST_ESTABLISHMENT_FIRST',
          name: 'ESTABLISHMENT_NAME_1',
          appTypes: [
            'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
            'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT',
            'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
            'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
            'PIN_PHONE_REMOVE_CONTACT',
            'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
          ],
          defaultDepartments: false,
          blacklistedAppGroups: [],
          blacklistedAppTypes: [],
        },
        initialApp: 3,
        type: 'DEPARTMENT',
      },
    },
    {
      id: 'b4e9944b-3a27-4d10-b12b-895426349ea3',
      establishmentId: 'TEST_ESTABLISHMENT_FIRST',
      status: 'PENDING',
      appType: { id: 5, name: 'Swap Visiting Orders (VOs) for PIN Credit' },
      requestedBy: 'A12345',
      requestedByFirstName: 'John',
      requestedByLastName: 'Smith',
      createdDate: '2025-03-21T14:03:13Z',
      genericForm: false,
      assignedGroup: {
        id: '60d7303f-f6e5-4ffd-8ef1-769a52d00983',
        name: 'Business Hub',
        establishment: {
          id: 'TEST_ESTABLISHMENT_FIRST',
          name: 'ESTABLISHMENT_NAME_1',
          appTypes: [
            'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
            'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT',
            'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
            'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
            'PIN_PHONE_REMOVE_CONTACT',
            'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
          ],
          defaultDepartments: false,
          blacklistedAppGroups: [],
          blacklistedAppTypes: [],
        },
        initialApp: 3,
        type: 'DEPARTMENT',
      },
    },
  ],
}

export const getAppsByType = (typeId: number) => {
  const filteredApps = appSearchResponse.apps.filter(a => a.appType.id === typeId) || []
  return {
    ...appSearchResponse,
    apps: filteredApps,
    totalRecords: filteredApps.length,
  }
}

export const getAppsSortedByOldest = () => {
  const sortedApps = [...appSearchResponse.apps].sort(
    (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
  )

  return {
    ...appSearchResponse,
    apps: sortedApps,
    totalRecords: sortedApps.length,
  }
}

export const buildAppsSearchResponse = (input?: typeof appSearchResponse | typeof appSearchResponse.apps) => {
  if (Array.isArray(input)) {
    return {
      ...appSearchResponse,
      apps: input,
      totalRecords: input.length,
    }
  }

  return input ?? appSearchResponse
}

export const appSearchPayload: ApplicationSearchPayload = {
  page: 1,
  size: 10,
  status: ['PENDING'],
  applicationTypes: null,
  requestedBy: null,
  assignedGroups: null,
}
