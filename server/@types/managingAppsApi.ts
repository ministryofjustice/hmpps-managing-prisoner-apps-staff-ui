import { components } from './managing-prisoner-apps-api'

export type ApplicationDto = components['schemas']['AppResponseDtoObjectObject']
export type ApplicationSearchPayload = components['schemas']['AppsSearchQueryDto']
export type AppResponsePayload = components['schemas']['AppDecisionRequestDto']
export type AppTypeResponse = components['schemas']['AppTypeResponse']
export type AssignedGroup = components['schemas']['AssignedGroupDto']
export type CommentDto = components['schemas']['CommentResponseDtoObject']
export type Department = components['schemas']['AssignedGroupDto']
export type History = components['schemas']['HistoryResponse']
export type PrisonerSearchResult = components['schemas']['RequestedByNameSearchResult']
export type AppDecisionResponse = components['schemas']['AppDecisionResponseDtoObject']
export type ViewAppListDto = components['schemas']['AppListViewDto']
export type ViewAppListAssignedGroup = components['schemas']['GroupAppListViewDto']

export interface ViewAppListApp extends ViewAppListDto {
  assignedGroup: AssignedGroup
}

export interface ViewAppsListResponse {
  page: number
  totalRecords: number
  exhausted: boolean
  applicationTypes: Record<string, { id: number; name: string; count: number }>
  assignedGroups: {
    id: string
    name: string
    count?: number
  }[]
  firstNightCenter: number
  apps: ViewAppListApp[]
}

export interface App extends ApplicationDto {
  applicationType: {
    id: number
    name: string
  }
  assignedGroup: AssignedGroup
  requestedBy: AppRequestedBy
  requests: AppRequest[]
}

export interface AppRequest {
  id: string
  responseId: string
  amount?: number
  reason?: string
  details?: string
  [key: string]: unknown
}

export interface AppRequestedBy {
  username: string
  userId: string
  firstName: string
  lastName: string
  category: string
  cellLocation: string
  location: string
  iep: string
}

export interface Comment extends CommentDto {
  createdBy: CommentCreatedBy
}

export interface CommentCreatedBy {
  username: string
  userId: string
  fullName: string
  category: string
  establishment: {
    id: string
    name: string
  }
}

export interface CommentsResponse {
  page: number
  totalElements: number
  exhausted: boolean
  contents: Comment[]
}

export interface ApplicationType {
  id: number
  name: string
  genericType: boolean
  genericForm: boolean
  logDetailRequired: boolean
}

export interface Group {
  id: number
  name: string
  appTypes: ApplicationType[]
}
