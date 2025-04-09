import { Application, ApplicationSearchPayload, Group, ViewApplicationsResponse } from '../../@types/managingAppsApi'
import { PrisonerDetail } from '../../@types/prisonApi'
import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import { BaseUser } from '../../interfaces/hmppsUser'

export default class TestData {
  app: Application = {
    id: '13d2c453-be11-44a8-9861-21fd8ae6e911',
    reference: '1232143',
    assignedGroup: {
      id: '591185f2-863a-4a32-9812-c12f40b94ccb',
      name: 'Business Hub',
      establishment: {
        id: 'ABC',
        name: 'HMP ABC',
      },
      initialApp: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
      type: 'DEPARTMENT',
      email: 'business+hub+ABC@justice.gov.uk',
    },
    appType: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
    requestedBy: {
      username: 'G123456',
      userId: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
      firstName: 'Emily',
      lastName: 'Brown',
      category: 'PRISONER',
      location: 'C-2-013',
      iep: 'Enhanced',
    },
    requestedDate: '2024-09-15T00:00:00Z',
    createdDate: '2024-09-16T12:38:03Z',
    createdBy: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
    lastModifiedBy: 'cb42921f-3b33-4efa-a873-4a1d86eb6caa',
    lastModifiedDate: '2024-09-16T12:38:03Z',
    requests: [
      {
        id: '8c33eb4e-9f32-411e-bb09-225615f0a266',
        responseId: '34500d92-10df-418b-b285-81cef7d0eb7a',
        pdfResponseUrl: 'https://....xyz.pdf',
        amount: 5.0,
      },
    ],
    status: APPLICATION_STATUS.PENDING,
  }

  prisoner: PrisonerDetail = {
    offenderNo: 'A0000AA',
    title: 'Earl',
    suffix: 'Mac',
    firstName: 'Thorfinn',
    middleNames: 'Skull-splitter',
    lastName: 'Torf-Einarsson',
    dateOfBirth: '1960-02-29',
    gender: 'Female',
    sexCode: 'F',
    nationalities: 'Scottish',
    currentlyInPrison: 'N',
    latestBookingId: 1,
    latestLocationId: 'WRI',
    latestLocation: 'Whitemoor (HMP)',
    internalLocation: 'WRI-B-3-018',
    pncNumber: '01/000000A',
    croNumber: '01/0001/01A',
    ethnicity: 'White: British',
    ethnicityCode: 'W1',
    birthCountry: 'Norway',
    religion: 'Pagan',
    religionCode: 'PAG',
    convictedStatus: 'Convicted',
    legalStatus: 'REMAND',
    imprisonmentStatus: 'LIFE',
    imprisonmentStatusDesc: 'Service Life Imprisonment',
    receptionDate: '1980-01-01',
    maritalStatus: 'Single',
    currentWorkingFirstName: 'Thorfinn',
    currentWorkingLastName: 'Torf-Einarsson',
    currentWorkingBirthDate: '1960-02-29',
  }

  user: BaseUser = {
    token: 'token',
    username: 'user',
    authSource: 'auth',
    userId: '608955ae-52ed-44cc-884c-011597a77949',
    name: 'name',
    displayName: 'Name',
    userRoles: [],
  }

  submitPrisonerAppData = {
    type: {
      value: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
      name: 'Swap visiting orders (VOs) for PIN credit',
      apiValue: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
    },
    prisonerId: 'G4567',
    prisonerName: 'Emily Brown',
    date: new Date('2024-09-15').toISOString(),
    additionalData: { swapVOsToPinCreditDetails: 'Swap visiting orders (VOs) for PIN credit' },
  }

  appSearchPayload: ApplicationSearchPayload = {
    page: 1,
    size: 10,
    status: ['PENDING'],
    types: null,
    requestedBy: null,
    assignedGroups: null,
  }

  appSearchResponse: ViewApplicationsResponse = {
    page: 1,
    totalRecords: 3,
    exhausted: true,
    types: {
      PIN_PHONE_CREDIT_TOP_UP: 0,
      PIN_PHONE_EMERGENCY_CREDIT_TOP_UP: 0,
      PIN_PHONE_ADD_NEW_CONTACT: 0,
      PIN_PHONE_REMOVE_CONTACT: 0,
      PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: 3,
    },
    assignedGroups: [
      {
        id: '60d7303f-f6e5-4ffd-8ef1-769a52d00983',
        name: 'Business Hub',
        count: 3,
      },
      {
        id: '72c73234-b618-4c65-9fb1-6b710be68474',
        name: 'OMU',
        count: 0,
      },
    ],
    apps: [
      {
        id: '1808f5e2-2bf4-499a-b79f-fb0a5f4bac7b',
        establishmentId: 'TEST_ESTABLISHMENT_FIRST',
        status: 'PENDING',
        appType: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
        requestedBy: 'A12345',
        requestedDate: '2025-03-24T14:03:13Z',
        assignedGroup: {
          id: '60d7303f-f6e5-4ffd-8ef1-769a52d00983',
          name: 'Business Hub',
        },
      },
      {
        id: '53a02b48-b6af-47d5-9c54-3d0137f6ed96',
        establishmentId: 'TEST_ESTABLISHMENT_FIRST',
        status: 'PENDING',
        appType: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
        requestedBy: 'A12345',
        requestedDate: '2025-03-23T14:03:13Z',
        assignedGroup: {
          id: '60d7303f-f6e5-4ffd-8ef1-769a52d00983',
          name: 'Business Hub',
        },
      },
      {
        id: 'b4e9944b-3a27-4d10-b12b-895426349ea3',
        establishmentId: 'TEST_ESTABLISHMENT_FIRST',
        status: 'PENDING',
        appType: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
        requestedBy: 'A12345',
        requestedDate: '2025-03-21T14:03:13Z',
        assignedGroup: {
          id: '60d7303f-f6e5-4ffd-8ef1-769a52d00983',
          name: 'Business Hub',
        },
      },
    ],
  }

  group: Group = {
    id: '916267ad-3ba6-4826-8d59-01cfbaa8420b',
    name: 'Business Hub',
    establishment: {
      id: 'TEST_ESTABLISHMENT_FIRST',
      name: 'TEST_ESTABLISHMENT_FIRST',
    },
    initialApp: 'PIN_PHONE_ADD_NEW_CONTACT',
    type: 'WING',
  }
}
