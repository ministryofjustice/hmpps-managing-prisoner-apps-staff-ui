import { App, Comment, CommentsResponse } from '../../server/@types/managingAppsApi'
import { stubFor } from '../mockApis/wiremock'

export type InternalCommentFixture = {
  id: string
  message: string
  createdDate: string
}

export const createInternalCommentFixture = ({
  id = 'staff-internal-comment-id',
  message = 'This is my internal use only comment',
  createdDate = '2026-07-10T10:00:00.000Z',
}: Partial<InternalCommentFixture> = {}): InternalCommentFixture => ({
  id,
  message,
  createdDate,
})

export const createAdditionalInternalCommentFixture = ({
  id = 'staff-additional-comment-id',
  message = 'This is an additional internal use only comment',
  createdDate = '2026-07-10T10:01:00.000Z',
}: Partial<InternalCommentFixture> = {}): InternalCommentFixture => ({
  id,
  message,
  createdDate,
})

const createInternalCommentResponse = (app: App, comment: InternalCommentFixture): Comment => ({
  id: comment.id,
  appId: app.id,
  message: comment.message,
  prisonerNumber: app.requestedBy.username,
  createdDate: comment.createdDate,
  visibility: 'STAFF_ONLY',
  createdByType: 'STAFF',
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
})

export const createInternalCommentsResponse = ({
  app,
  comments,
}: {
  app: App
  comments: InternalCommentFixture[]
}): CommentsResponse => ({
  page: 1,
  totalElements: comments.length,
  exhausted: true,
  contents: comments.map(comment => createInternalCommentResponse(app, comment)),
})

const createInternalHistoryItem = (app: App, comment: InternalCommentFixture) => ({
  id: `history-item-${comment.id}`,
  appId: app.id,
  entityId: comment.id,
  entityType: 'COMMENT',
  activityMessage: {
    header: 'Comment added',
    createdBy: 'John Doe',
    body: comment.message,
  },
  createdDate: comment.createdDate,
})

export const stubStaffOnlyCommentHistoryFlow = async ({
  app,
  comment,
  additionalComment = createAdditionalInternalCommentFixture(),
}: {
  app: App
  comment: InternalCommentFixture
  additionalComment?: InternalCommentFixture
}) => {
  await stubFor({
    request: {
      method: 'POST',
      url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/comments`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: createInternalCommentResponse(app, comment),
    },
  })

  await stubFor({
    request: {
      method: 'GET',
      url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/comments?page=1&size=20`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: createInternalCommentsResponse({
        app,
        comments: [comment, additionalComment],
      }),
    },
  })

  await stubFor({
    request: {
      method: 'GET',
      url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/history`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [createInternalHistoryItem(app, comment), createInternalHistoryItem(app, additionalComment)],
    },
  })
}
