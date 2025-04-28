export interface Establishment {
  id: string
  name: string
}

export interface AssignedGroup {
  id: string
  name: string
  establishment: Establishment
  initialApp: string
  type: string
  email: string
}

export interface RequestedBy {
  username: string
  userId: string
  firstName: string
  lastName: string
  category: string
  location: string
  iep: string
}

export interface ApplicationRequest {
  id: string
  responseId: string
  details?: string
  amount?: number
  reason?: string
}

export interface Application {
  id: string
  appType: string
  assignedGroup: AssignedGroup
  createdBy: string
  createdDate: string
  lastModifiedBy: string
  lastModifiedDate: string
  reference: string
  requestedBy: RequestedBy
  requestedDate: string
  requests: ApplicationRequest[]
  status: 'PENDING' | 'APPROVED' | 'DECLINED'
}

export type ApplicationSearchPayload = {
  page: number
  size: number
  status: string[]
  types: string[] | null
  requestedBy: string | null
  assignedGroups: string[] | null
}

type ApplicationType =
  | 'PIN_PHONE_CREDIT_TOP_UP'
  | 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP'
  | 'PIN_PHONE_ADD_NEW_CONTACT'
  | 'PIN_PHONE_REMOVE_CONTACT'
  | 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS'

export type ViewApplicationsResponseAssignedGroup = {
  id: string
  name: string
  count: number
}

export type ViewApplicationsResponseApplication = {
  id: string
  establishmentId: string
  status: 'PENDING' | 'CLOSED'
  appType: ApplicationType
  requestedBy: string
  requestedByFirstName: string
  requestedByLastName: string
  requestedDate: string
  assignedGroup: {
    id: string
    name: string
  }
}

export type ViewApplicationsResponse = {
  page: number
  totalRecords: number
  exhausted: boolean
  types: Record<ApplicationType, number>
  assignedGroups: ViewApplicationsResponseAssignedGroup[]
  apps: ViewApplicationsResponseApplication[]
}

export type Group = {
  id: string
  name: string
  establishment: Establishment
  initialApp: string
  type: string
}

export type PrisonerSearchResult = {
  prisonerId: string
  firstName: string
  lastName: string
}

export type CommentsResponse = {
  page: number
  exhausted: boolean
  totalElements: number
  contents: Comment[]
}

export type Comment = {
  id: string
  appId: string
  prisonerNumber: string
  message: string
  createdDate: string
  createdBy: StaffUser
}

export type TargetUser = {
  id: string
}

type StaffUser = {
  username: string
  userId: string
  fullName: string
  category: 'STAFF'
  establishment: Establishment
}

export type AppResponsePayload = { reason: string; decision: string; appliesTo: string[] }

export type Response = {
  id: string
  prisonerId: string
  appId: string
  reason: string
  decision: 'APPROVED' | 'DECLINED'
  createdDate: string
  createdBy: {
    username: string
    userId: string
    fullName: string
    category: string
    establishment: Establishment
  }
  appliesTo: string[]
}
