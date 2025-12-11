import { Comment, CommentsResponse } from '../../@types/managingAppsApi'

export const comment: Comment = {
  id: '8980f68a-eabd-4b00-9ef3-a5d733da3a9f',
  appId: 'f4da49b9-f5d6-4931-9e81-aa6d69a12b2a',
  message: 'This is my first comment',
  prisonerNumber: 'G3682UE',
  createdDate: '2025-04-09T15:57:29Z',
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
}

export const commentsResponse: CommentsResponse = {
  page: 1,
  totalElements: 1,
  exhausted: true,
  contents: [comment],
}
