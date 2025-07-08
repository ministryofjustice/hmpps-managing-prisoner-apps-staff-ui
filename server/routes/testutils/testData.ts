import {
  Application,
  ApplicationSearchPayload,
  ApplicationType,
  Comment,
  CommentsResponse,
  Group,
  History,
  Response,
  ViewApplicationsResponse,
} from '../../@types/managingAppsApi'
import { PrisonerDetail } from '../../@types/prisonApi'
import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import { APPLICATION_TYPE_VALUES, applicationTypeLabels } from '../../constants/applicationTypes'
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
        reason: 'reason',
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
      key: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
    },
    prisonerId: 'G4567',
    prisonerName: 'Emily Brown',
    date: new Date('2024-09-15').toISOString(),
    additionalData: { details: 'Swap visiting orders (VOs) for PIN credit' },
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
      PIN_PHONE_EMERGENCY_CREDIT_TOP_UP: 0,
      PIN_PHONE_ADD_NEW_SOCIAL_CONTACT: 0,
      PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: 3,
      PIN_PHONE_SUPPLY_LIST_OF_CONTACTS: 0,
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
        requestedByFirstName: 'John',
        requestedByLastName: 'Smith',
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
        requestedByFirstName: 'John',
        requestedByLastName: 'Smith',
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
        requestedByFirstName: 'John',
        requestedByLastName: 'Smith',
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
    initialApp: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
    type: 'WING',
  }

  comment: Comment = {
    id: '8980f68a-eabd-4b00-9ef3-a5d733da3a9f',
    appId: 'f4da49b9-f5d6-4931-9e81-aa6d69a12b2a',
    message: 'This is my first comment',
    prisonerNumber: 'G3682UE',
    createdDate: '2025-04-09T15:57:29Z',
    createdBy: {
      username: 'ZFAITHFULL_GEN',
      userId: '487900',
      fullName: 'Zak Faithfull',
      category: 'STAFF',
      establishment: {
        id: 'TEST_ESTABLISHMENT_FIRST',
        name: 'ESTABLISHMENT_NAME_1',
      },
    },
  }

  commentsResponse: CommentsResponse = {
    page: 1,
    totalElements: 1,
    exhausted: true,
    contents: [this.comment],
  }

  response: Response = {
    id: 'be0e8ede-aeb4-432f-b115-a57c39d1579b',
    prisonerId: 'G3682UE',
    appId: '991acfa4-39e9-4b08-b81c-cf5b95edd55e',
    reason: '',
    decision: 'APPROVED',
    createdDate: '2025-04-10T14:11:14.440791',
    createdBy: {
      username: 'ZFAITHFULL_GEN',
      userId: '487900',
      fullName: 'Zak Faithfull',
      category: 'STAFF',
      establishment: {
        id: 'TEST_ESTABLISHMENT_FIRST',
        name: 'ESTABLISHMENT_NAME_1',
      },
    },
    appliesTo: ['9242f1d0-3c4f-49f2-84e1-dcfefe5113d0'],
  }

  historyResponse: History[] = [
    {
      id: 'd8d267c0-42ac-42bf-a72f-2f826e1ee049',
      appId: '4d122405-27a1-4603-80cc-d7252a4e43ee',
      entityId: '1ebf7110-82cf-4dc1-b872-92c7d71847fc',
      entityType: 'ASSIGNED_GROUP',
      activityMessage: {
        header: 'Logged by Sweety John',
        body: 'Assigned to OMU',
      },
      createdDate: '2025-05-13T08:44:02Z',
    },
    {
      id: '26aae683-6dcb-432f-bf5d-f46752d809f1',
      appId: '4d122405-27a1-4603-80cc-d7252a4e43ee',
      entityId: '343a7876-07b9-4ef8-947c-7cf554fae864',
      entityType: 'ASSIGNED_GROUP',
      activityMessage: {
        header: 'Forwarded to group Business Hub by Sweety John',
        body: 'Assigned to BH',
      },
      createdDate: '2025-05-13T10:11:23Z',
    },
    {
      id: '1084ce95-b2f2-4e5e-8e49-9b60c0d5e643',
      appId: '4d122405-27a1-4603-80cc-d7252a4e43ee',
      entityId: '59927020-5141-4df8-baef-3f327397ed70',
      entityType: 'COMMENT',
      activityMessage: {
        header: 'Comment added by Sweety John',
      },
      createdDate: '2025-05-13T10:12:22Z',
    },
    {
      id: 'bca2a226-ef95-41ce-951d-dac63f2bb827',
      appId: '4d122405-27a1-4603-80cc-d7252a4e43ee',
      entityId: '973b3526-18d4-420d-a721-6345887680ee',
      entityType: 'RESPONSE',
      activityMessage: {
        header: 'Marked as declined by Sweety John',
      },
      createdDate: '2025-05-13T10:17:36Z',
    },
  ]

  supportedPrisonIds = ({ prisonIds = ['HEI', 'BLI'] } = {}): string[] => prisonIds

  appTypes: ApplicationType[] = [
    {
      key: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
      value: APPLICATION_TYPE_VALUES.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP,
      name: applicationTypeLabels.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP,
    },
    {
      key: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
      value: APPLICATION_TYPE_VALUES.PIN_PHONE_ADD_NEW_SOCIAL_CONTACT,
      name: applicationTypeLabels.PIN_PHONE_ADD_NEW_SOCIAL_CONTACT,
    },
    {
      key: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
      value: APPLICATION_TYPE_VALUES.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS,
      name: applicationTypeLabels.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS,
    },
    {
      key: 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
      value: APPLICATION_TYPE_VALUES.PIN_PHONE_SUPPLY_LIST_OF_CONTACTS,
      name: applicationTypeLabels.PIN_PHONE_SUPPLY_LIST_OF_CONTACTS,
    },
  ]
}
