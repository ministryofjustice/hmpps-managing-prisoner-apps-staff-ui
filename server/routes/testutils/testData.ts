import { Application } from '../../@types/managingAppsApi'
import { PrisonerDetail } from '../../@types/prisonApi'
import { APPLICATION_STATUS } from '../../constants/applicationStatus'
import { BaseUser } from '../../interfaces/hmppsUser'

export default class TestData {
  prisonerApp: Application = {
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

  sections = [
    {
      title: 'Departments',
      items: [
        { name: 'Business Hub', tagText: '44', path: '' },
        { name: 'OMU', tagText: '9', path: '' },
      ],
    },
    {
      title: 'Wings',
      items: [
        { name: 'First Night Centre', tagText: '3', path: '' },
        { name: 'A', tagText: '0', path: '' },
        { name: 'B', tagText: '2', path: '' },
        { name: 'C', tagText: '1', path: '' },
        { name: 'D', tagText: '0', path: '' },
        { name: 'E', tagText: '1', path: '' },
      ],
    },
    {
      title: 'Governors',
      items: [
        { name: 'Paul White', tagText: '1', path: '' },
        { name: 'James Smart', tagText: '0', path: '' },
        { name: 'Syed Hasan', tagText: '4', path: '' },
      ],
    },
  ]

  user: BaseUser = {
    token: 'token',
    username: 'user',
    authSource: 'auth',
    userId: '608955ae-52ed-44cc-884c-011597a77949',
    name: 'name',
    displayName: 'Name',
    userRoles: [],
  }
}
