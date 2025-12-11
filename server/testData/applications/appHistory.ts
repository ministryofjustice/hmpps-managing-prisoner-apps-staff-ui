import { History } from '../../@types/managingAppsApi'

// eslint-disable-next-line import/prefer-default-export
export const appHistoryResponse: History[] = (['ASSIGNED_GROUP', 'ASSIGNED_GROUP', 'COMMENT', 'RESPONSE'] as const).map(
  (entityType, index) => ({
    id: `test-id-${index}`,
    appId: '4d122405-27a1-4603-80cc-d7252a4e43ee',
    entityId: `test-entity-id-${index}`,
    entityType,
    activityMessage: {
      header: `Activity header for ${entityType}`,
      ...(entityType === 'ASSIGNED_GROUP' && { body: 'Assigned to group' }),
    },
    createdDate: new Date(Date.now() + index * 1000).toISOString(),
  }),
)
