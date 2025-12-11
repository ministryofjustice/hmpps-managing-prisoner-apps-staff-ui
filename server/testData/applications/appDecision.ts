import { AppDecisionResponse } from '../../@types/managingAppsApi'

// eslint-disable-next-line import/prefer-default-export
export const appDecisionResponse: AppDecisionResponse = {
  id: 'be0e8ede-aeb4-432f-b115-a57c39d1579b',
  prisonerId: 'G3682UE',
  appId: '991acfa4-39e9-4b08-b81c-cf5b95edd55e',
  reason: '',
  decision: 'APPROVED',
  createdDate: '2025-04-10T14:11:14.440791',
  createdBy: {
    username: 'TEST_GEN',
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
