import { App } from '../../@types/managingAppsApi'
import { APPLICATION_STATUS } from '../../constants/applicationStatus'

export const app: App = {
  id: '13d2c453-be11-44a8-9861-21fd8ae6e911',
  reference: '1232143',
  genericForm: false,
  assignedGroup: {
    id: '591185f2-863a-4a32-9812-c12f40b94ccb',
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
    initialApp: 1,
    type: 'DEPARTMENT',
  },
  appType: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
  applicationType: {
    id: 3,
    name: 'Swap visiting orders (VOs) for PIN credit',
  },
  applicationGroup: {
    id: 1,
    name: 'BT PIN PHONES',
  },
  requestedBy: {
    username: 'G123456',
    userId: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
    firstName: 'Emily',
    lastName: 'Brown',
    category: 'PRISONER',
    cellLocation: 'A-0-123',
    location: 'Preston (HMP)',
    iep: 'Enhanced',
  },
  createdDate: '2024-09-15T00:00:00Z',
  createdBy: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
  lastModifiedBy: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
  lastModifiedDate: '2024-09-16T12:38:03Z',
  requests: [
    {
      id: '8c33eb4e-9f32-411e-bb09-225615f0a266',
      responseId: '34500d92-10df-418b-b285-81cef7d0eb7a',
      reason: 'reason',
      amount: 5.0,
    },
  ],
  status: APPLICATION_STATUS.PENDING,
  firstNightCenter: true,
  requestedDate: '',
  requestedByFirstName: '',
  requestedByLastName: '',
  establishmentId: '',
}

export const submitPrisonerAppData = {
  type: {
    value: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
    name: 'Swap visiting orders (VOs) for PIN credit',
    key: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
  },
  prisonerId: 'G4567',
  prisonerName: 'Emily Brown',
  group: {
    name: 'PIN phones',
    value: '1',
  },
  department: '343a7876-07b9-4ef8-947c-7cf554fae864',
  date: new Date('2024-09-15').toISOString(),
  additionalData: { details: 'Swap visiting orders (VOs) for PIN credit' },
}
