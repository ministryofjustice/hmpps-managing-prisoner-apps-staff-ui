import nock from 'nock'

import config from '../config'
import HmppsManageUsersClient from './hmppsManageUsersClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsManageUsersClient', () => {
  let fakeManageUsersUrl: nock.Scope
  let hmppsManageUsersClient: HmppsManageUsersClient

  beforeEach(() => {
    fakeManageUsersUrl = nock(config.apis.hmppsManageUsers.url)
    hmppsManageUsersClient = new HmppsManageUsersClient()
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeManageUsersUrl
        .get('/users/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsManageUsersClient.getUser(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', async () => {
      fakeManageUsersUrl
        .get('/users/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsManageUsersClient.getUserRoles(token.access_token)
      expect(output).toEqual(['role1', 'role2'])
    })
  })
})
