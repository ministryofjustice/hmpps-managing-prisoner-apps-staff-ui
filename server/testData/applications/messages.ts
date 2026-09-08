import { Comment, CommentsResponse } from '../../@types/managingAppsApi'

export const message: Comment = {
  id: '7b0c2d3e-1a2b-4c5d-8e9f-0a1b2c3d4e5f',
  appId: 'f4da49b9-f5d6-4931-9e81-aa6d69a12b2a',
  message: 'This is a message to the prisoner',
  prisonerNumber: 'G3682UE',
  createdDate: '2025-04-09T15:57:29Z',
  createdBy: {
    username: 'TEST_GEN',
    userId: '487900',
    fullName: 'Staff Name',
    category: 'STAFF',
    establishment: {
      id: 'TEST_ESTABLISHMENT_FIRST',
      name: 'ESTABLISHMENT_NAME_1',
    },
  },
  visibility: 'STAFF_AND_PRISONER',
  createdByType: 'STAFF',
}

export const messagesResponse: CommentsResponse = {
  page: 1,
  totalElements: 1,
  exhausted: true,
  contents: [message],
}
