import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import ApplicationHistoryPage from '../pages/applicationHistoryPage'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

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
