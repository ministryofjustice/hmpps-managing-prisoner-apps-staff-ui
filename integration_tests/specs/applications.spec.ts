import { test } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import { resetStubs } from '../mockApis/wiremock'
import Page from '../pages/page'
import IndexPage from '../pages'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Applications Page', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }
    await signIn()
    if (isWiremock) {
      await page.goto('/')
    }
  })

  test('should display the page title', async ({ page }) => {
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    await indexPage.assertBrowserTitleContains('Applications')
  })

  test('should display the banner with the correct content', async ({ page }) => {
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    await indexPage.assertBannerContent()
  })

  test('should display the Log a new application card', async ({ page }) => {
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    await indexPage.assertLogNewApplicationCard()
  })

  test('should display the View all applications card', async ({ page }) => {
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    await indexPage.assertViewAllApplicationsCard()
  })
})
