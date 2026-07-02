import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
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

  test('should allow a user to add a comment and display it', async ({ page }) => {
    if (isWiremock) {
      await managingPrisonerAppsApi.stubAddComments({ app })
      await managingPrisonerAppsApi.stubGetComments({ app })
    }

    const commentsPage = new CommentsPage(page)
    await commentsPage.commentBox().fill('This is my first comment')
    await commentsPage.submitButton().click()

    await expect(page).toHaveURL(`/applications/${app.requestedBy.username}/${app.id}/comments`)
    await expect(page.getByText('This is my first comment')).toBeVisible()
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
