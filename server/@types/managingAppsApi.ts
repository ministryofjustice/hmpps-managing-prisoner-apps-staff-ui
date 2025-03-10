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
  pdfResponseUrl: string
  amount: number
}

export interface Application {
  id: string
  reference: string
  assignedGroup: AssignedGroup
  appType: string
  requestedBy: RequestedBy
  requestedDate: string
  createdDate: string
  createdBy: string
  lastModifiedBy: string
  lastModifiedDate: string
  requests: ApplicationRequest[]
}
