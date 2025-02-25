import { Application } from '../../@types/managingAppsApi'
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
      initialApp: 'SWAP_VISITING_ORDERS_FOR_PIN_CREDIT',
      type: 'DEPARTMENT',
      email: 'business+hub+ABC@justice.gov.uk',
    },
    type: 'SWAP_VISITING_ORDERS_FOR_PIN_CREDIT',
    requestedBy: {
      id: 'G123456',
      firstName: 'Emily',
      lastName: 'Brown',
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
}
