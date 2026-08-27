import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import MessagesPage from '../pages/messagesPage'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs, stubFor } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

const stubMessageSubmissionWithVisibility = async ({
  message,
  visibility,
}: {
  message: string
  visibility: 'STAFF_ONLY' | 'STAFF_AND_PRISONER'
}) => {
  await stubFor({
    priority: 1,
    request: {
      method: 'POST',
      url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/messages`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        id: 'comment-id-1',
        appId: app.id,
        message,
        prisonerNumber: app.requestedBy.username,
        createdDate: '2025-04-09T15:57:29Z',
        visibility,
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
    },
  })

  await stubFor({
    priority: 1,
    request: {
      method: 'GET',
      url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/messages?page=1&size=20&createdBy=true`,
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
            id: 'comment-id-1',
            appId: app.id,
            message,
            prisonerNumber: app.requestedBy.username,
            createdDate: '2025-04-09T15:57:29Z',
            visibility,
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
}

test.describe('Prisoner Messages Page', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app })
      await managingPrisonerAppsApi.stubGetMessages({ app })
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/messages`)
  })

  test('should display the correct page title', async ({ page }) => {
    const messagesPage = new MessagesPage(page)
    const title = await messagesPage.pageTitle()
    expect(title).toMatch(/Prisoner messages/)
  })

  test('should highlight the prisoner messages tab as active in sub-navigation', async ({ page }) => {
    const messagesPage = new MessagesPage(page)
    await expect(messagesPage.subNavigation()).toBeVisible()
    await expect(messagesPage.activeTab()).toContainText(/Prisoner messages/)
  })

  test('should display the message form', async ({ page }) => {
    const messagesPage = new MessagesPage(page)
    await expect(messagesPage.commentLabel()).toContainText(/Send message/)
    await expect(messagesPage.commentBox()).toBeVisible()
    await expect(messagesPage.submitButton()).toContainText(/Send/)
  })

  test('should send a message with prisoner-and-staff visibility', async ({ page }) => {
    if (isWiremock) {
      await stubMessageSubmissionWithVisibility({
        message: 'Shared with prisoner',
        visibility: 'STAFF_AND_PRISONER',
      })
    }

    const messagesPage = new MessagesPage(page)
    await messagesPage.commentBox().fill('Shared with prisoner')
    await messagesPage.submitButton().click()

    await expect(page).toHaveURL(`/applications/${app.requestedBy.username}/${app.id}/messages`)
    await expect(page.locator('.app-message-item--prisoner-and-staff')).toBeVisible()
    await expect(page.locator('.moj-message-item__text--sent', { hasText: 'Shared with prisoner' })).toBeVisible()
  })

  test('should show an error message when no message is entered', async ({ page }) => {
    const messagesPage = new MessagesPage(page)
    await messagesPage.submitButton().click()

    await expect(messagesPage.errorSummary()).toContainText('Add a message')
    await expect(messagesPage.errorMessage()).toContainText('Add a message')
  })
})

test.describe('Prisoner Messages Page - closed application', () => {
  const closedStatuses = [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DECLINED]

  for (const status of closedStatuses) {
    test.describe(`when the application is ${status}`, () => {
      const closedApp = { ...app, status }

      test.beforeEach(async ({ page, signIn }) => {
        if (isWiremock) {
          await resetStubs()
          await auth.stubSignIn()
          await prisonApi.stubGetCaseLoads()
          await managingPrisonerAppsApi.stubGetPrisonerApp({ app: closedApp })
          await managingPrisonerAppsApi.stubGetMessages({ app: closedApp })
          await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        }

        await signIn()
        await page.goto(`/applications/${closedApp.requestedBy.username}/${closedApp.id}/messages`)
      })

      test('should not display the send message form', async ({ page }) => {
        const messagesPage = new MessagesPage(page)
        await expect(messagesPage.commentsSectionHeading()).toBeVisible()
        await expect(messagesPage.commentForm()).toHaveCount(0)
        await expect(messagesPage.commentBox()).toHaveCount(0)
        await expect(messagesPage.submitButton()).toHaveCount(0)
      })
    })
  }
})
