import nock from 'nock'

import config from '../config'
import HmppsManageUsersClient from './hmppsManageUsersClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsManageUsersClient', () => {
  let fakeManangeUsersUrl: nock.Scope
  let hmppsManangeUsersClient: HmppsManageUsersClient

  beforeEach(() => {
    fakeManangeUsersUrl = nock(config.apis.hmppsManageUsers.url)
    hmppsManangeUsersClient = new HmppsManageUsersClient()
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeManangeUsersUrl
        .get('/users/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsManangeUsersClient.getUser(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', async () => {
      fakeManangeUsersUrl
        .get('/users/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsManangeUsersClient.getUserRoles(token.access_token)
      expect(output).toEqual(['role1', 'role2'])
    })
  })
})
