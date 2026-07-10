import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import CommentsPage from '../pages/commentsPage'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs, stubFor } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

const stubCommentSubmissionWithVisibility = async ({
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
      url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/comments`,
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

test.describe('Comments Page', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app })
      await managingPrisonerAppsApi.stubGetComments({ app })
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/comments`)
  })

  test('should display the correct page title', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    const title = await commentsPage.pageTitle()
    expect(title).toMatch(/Messages/)
  })

  test('should highlight the messages tab as active in sub-navigation', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await expect(commentsPage.subNavigation()).toBeVisible()
    await expect(commentsPage.activeTab()).toContainText(/Messages/)
  })

  test('should display the message form', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await expect(commentsPage.commentLabel()).toContainText(/Send message/)
    await expect(commentsPage.commentBox()).toBeVisible()
    await expect(commentsPage.submitButton()).toContainText(/Send/)
  })

  test('should display the comments section', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await expect(commentsPage.commentsSectionHeading()).toBeVisible()
  })

  test('should allow navigating to Action and reply from Messages', async ({ page }) => {
    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetAppResponse({ app, decision: undefined })
    }

    const actionAndReplyTab = page.locator('.moj-sub-navigation__link:has-text("Action and reply")')
    await expect(actionAndReplyTab).toHaveAttribute('href', `/applications/${app.requestedBy.username}/${app.id}/reply`)

    await actionAndReplyTab.click()

    await expect(page).toHaveURL(`/applications/${app.requestedBy.username}/${app.id}/reply`)
    await expect(page.getByRole('heading', { name: 'Action and reply' })).toBeVisible()
  })

  test('should allow a user to add a comment and display it', async ({ page }) => {
    if (isWiremock) {
      await managingPrisonerAppsApi.stubAddComments({ app })
      await managingPrisonerAppsApi.stubGetComments({ app })
    }

    const commentsPage = new CommentsPage(page)
    await commentsPage.commentBox().fill('This is my first comment')
    await page.getByRole('radio', { name: 'Staff only' }).check()
    await commentsPage.submitButton().click()

    await expect(page).toHaveURL(`/applications/${app.requestedBy.username}/${app.id}/comments`)
    await expect(page.locator('.moj-message-item__text--sent', { hasText: 'This is my first comment' })).toBeVisible()
    await expect(page.getByText('Staff Name')).toBeVisible()
    await expect(page.getByText('9 April 2025')).toBeVisible()
  })

  test('should show staff only visibility when sending a staff-only message', async ({ page }) => {
    if (isWiremock) {
      await stubCommentSubmissionWithVisibility({
        message: 'Staff only message',
        visibility: 'STAFF_ONLY',
      })
    }

    const commentsPage = new CommentsPage(page)
    await commentsPage.commentBox().fill('Staff only message')
    await page.getByRole('radio', { name: 'Staff only' }).check()
    await commentsPage.submitButton().click()

    await expect(page).toHaveURL(`/applications/${app.requestedBy.username}/${app.id}/comments`)
    await expect(page.locator('.app-message-item--staff-only')).toBeVisible()
    await expect(page.locator('.app-message-visibility--staff-only')).toContainText('Staff only')
    await expect(page.locator('.moj-message-item__text--sent', { hasText: 'Staff only message' })).toBeVisible()
  })

  test('should show staff and prisoner visibility when sending a prisoner-and-staff message', async ({ page }) => {
    if (isWiremock) {
      await stubCommentSubmissionWithVisibility({
        message: 'Shared with prisoner',
        visibility: 'STAFF_AND_PRISONER',
      })
    }

    const commentsPage = new CommentsPage(page)
    await commentsPage.commentBox().fill('Shared with prisoner')
    await page.getByRole('radio', { name: 'Prisoner and staff' }).check()
    const confirmVisibilityButton = page.locator('#visibility-modal-confirm')
    await expect(confirmVisibilityButton).toBeVisible()
    await confirmVisibilityButton.click()

    await expect(page).toHaveURL(`/applications/${app.requestedBy.username}/${app.id}/comments`)
    await expect(page.locator('.app-message-item--prisoner-and-staff')).toBeVisible()
    await expect(page.locator('.app-message-visibility--prisoner-and-staff')).toContainText('Staff and prisoner')
    await expect(page.locator('.moj-message-item__text--sent', { hasText: 'Shared with prisoner' })).toBeVisible()
  })

  test('should show an error message when no comment is entered', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await commentsPage.submitButton().click()

    await expect(commentsPage.errorSummary()).toContainText('Add a message')
    await expect(commentsPage.errorSummary()).toContainText(
      'Select if this message is for staff only, or for prisoner and staff',
    )
    await expect(commentsPage.errorMessage()).toContainText('Add a message')
    await expect(commentsPage.visibilityErrorMessage()).toContainText(
      'Select if this message is for staff only, or for prisoner and staff',
    )
  })
})

test.describe('Comments Page - closed application', () => {
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
          await managingPrisonerAppsApi.stubGetComments({ app: closedApp })
          await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        }

        await signIn()
        await page.goto(`/applications/${closedApp.requestedBy.username}/${closedApp.id}/comments`)
      })

      test('should not display the send message form', async ({ page }) => {
        const commentsPage = new CommentsPage(page)
        await expect(commentsPage.commentsSectionHeading()).toBeVisible()
        await expect(commentsPage.commentForm()).toHaveCount(0)
        await expect(commentsPage.commentBox()).toHaveCount(0)
        await expect(commentsPage.submitButton()).toHaveCount(0)
      })
    })
  }
})
