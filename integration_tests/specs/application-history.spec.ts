import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import ApplicationHistoryPage from '../pages/applicationHistoryPage'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs, stubFor } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Application History Page', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app })
      await managingPrisonerAppsApi.stubGetComments({ app })
      await managingPrisonerAppsApi.stubGetHistory({ app })
      await managingPrisonerAppsApi.stubGetAppResponse({ app })
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/history`)
  })

  test('should display the page title', async ({ page }) => {
    const historyPage = new ApplicationHistoryPage(page)
    await expect(historyPage.pageTitle()).toContainText('History')
  })

  test('should display the History section', async ({ page }) => {
    const historyPage = new ApplicationHistoryPage(page)
    await expect(historyPage.historyTab()).toBeVisible()
    await expect(historyPage.historyTab()).toContainText('History')
    await expect(historyPage.historyTab()).toHaveAttribute(
      'href',
      `/applications/${app.requestedBy.username}/${app.id}/history`,
    )
  })

  test('should display the application type name in the caption', async ({ page }) => {
    const historyPage = new ApplicationHistoryPage(page)
    await expect(historyPage.pageCaption()).toContainText('Add a social PIN phone contact')
  })

  test('should display the history page content', async ({ page }) => {
    const historyPage = new ApplicationHistoryPage(page)
    await expect(historyPage.historyContent()).toBeVisible()
  })
})

test.describe('Application History Page message rendering', () => {
  const commentId = 'history-comment-id'
  const responseId = 'history-response-id'

  test.beforeEach(async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Custom WireMock stubs are required for this scenario')

    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetPrisonerApp({ app })
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()

    await stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/history`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            id: 'history-item-assigned',
            appId: app.id,
            entityId: 'assigned-group-id',
            entityType: 'ASSIGNED_GROUP',
            activityMessage: {
              header: 'Assigned to central team',
              body: 'Assigned to group',
            },
            createdDate: '2026-07-10T10:00:00.000Z',
          },
          {
            id: 'history-item-comment',
            appId: app.id,
            entityId: commentId,
            entityType: 'COMMENT',
            activityMessage: {
              header: 'Staff comment added',
            },
            createdDate: '2026-07-10T10:01:00.000Z',
          },
          {
            id: 'history-item-response',
            appId: app.id,
            entityId: responseId,
            entityType: 'RESPONSE',
            activityMessage: {
              header: 'Decision recorded',
            },
            createdDate: '2026-07-10T10:02:00.000Z',
          },
        ],
      },
    })

    await stubFor({
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/comments?page=1&size=20&createdBy=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          page: 1,
          totalElements: 1,
          exhausted: true,
          contents: [
            {
              id: commentId,
              appId: app.id,
              message: 'History comment is visible',
              prisonerNumber: app.requestedBy.username,
              createdDate: '2026-07-10T10:01:10.000Z',
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
            },
          ],
        },
      },
    })

    await stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/responses/${responseId}.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          id: responseId,
          prisonerId: app.requestedBy.username,
          appId: app.id,
          decision: 'DECLINED',
          reason: 'Response reason is visible',
          createdDate: '2026-07-10T10:02:10.000Z',
          appliesTo: [],
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
        },
      },
    })

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/history`)
  })

  test('should display comment and response messages when history items reference them', async ({ page }) => {
    await expect(page.getByText('History comment is visible')).toBeVisible()
    await expect(page.getByText('Response reason is visible')).toBeVisible()
    await expect(page.getByText('Assigned to group')).toBeVisible()
  })
})
