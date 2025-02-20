import logger from '../../logger'
import { ActiveCaseLoad } from '../@types/template'
import config from '../config'
import RestClient from './restClient'

export interface User {
  username: string
  name: string
  activeCaseLoadId: string
  token: string
  authSource: string
  userId?: string
  meta?: ActiveCaseLoad
}

export interface UserRole {
  roleCode: string
}

export default class HmppsManageUsersClient {
  private restClient(token: string): RestClient {
    return new RestClient('HMPPS Manage Users Client', config.apis.hmppsManageUsers, token)
  }

  getUser(token: string): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Manage Users`)
    return this.restClient(token).get({ path: '/users/me' })
  }

  getUserRoles(token: string): Promise<string[]> {
    return this.restClient(token)
      .get({ path: '/users/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode)) as Promise<string[]>
  }
}
