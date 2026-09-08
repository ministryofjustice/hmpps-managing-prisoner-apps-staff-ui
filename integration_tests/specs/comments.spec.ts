import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import CommentsPage from '../pages/commentsPage'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

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
    expect(title).toMatch(/Comments/)
  })

  test('should highlight the comments tab as active in sub-navigation', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await expect(commentsPage.subNavigation()).toBeVisible()
    await expect(commentsPage.activeTab()).toContainText(/Comments/)
  })

  test('should display the comments table with the correct columns', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await expect(commentsPage.commentsTable()).toBeVisible()
    await expect(commentsPage.tableHeaders()).toContainText(['Comments', 'From', 'Date'])
  })

  test('should display a staff-only comment in the table', async ({ page }) => {
    await expect(page.getByRole('cell', { name: 'This is my first comment' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Staff Name' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '9 April 2025' })).toBeVisible()
  })

  test('should display the send comment form', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await expect(commentsPage.commentLabel()).toContainText(/Send comment/)
    await expect(commentsPage.commentBox()).toBeVisible()
    await expect(commentsPage.submitButton()).toContainText(/Send/)
  })

  test('should allow a user to add a comment and display it', async ({ page }) => {
    if (isWiremock) {
      await managingPrisonerAppsApi.stubAddComments({ app })
      await managingPrisonerAppsApi.stubGetComments({ app })
    }

    const commentsPage = new CommentsPage(page)
    await commentsPage.commentBox().fill('This is my first comment')
    await commentsPage.submitButton().click()

    await expect(page).toHaveURL(`/applications/${app.requestedBy.username}/${app.id}/comments`)
    await expect(page.getByRole('cell', { name: 'This is my first comment' })).toBeVisible()
    await expect(page.getByText('Staff Name')).toBeVisible()
    await expect(page.getByText('9 April 2025')).toBeVisible()
  })

  test('should show an error message when no comment is entered', async ({ page }) => {
    const commentsPage = new CommentsPage(page)
    await commentsPage.submitButton().click()

    await expect(commentsPage.errorSummary()).toContainText('Add a comment')
    await expect(commentsPage.errorMessage()).toContainText('Add a comment')
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

      test('should not display the send comment form', async ({ page }) => {
        const commentsPage = new CommentsPage(page)
        await expect(commentsPage.commentsTable()).toBeVisible()
        await expect(commentsPage.commentForm()).toHaveCount(0)
        await expect(commentsPage.commentBox()).toHaveCount(0)
        await expect(commentsPage.submitButton()).toHaveCount(0)
      })
    })
  }
})
