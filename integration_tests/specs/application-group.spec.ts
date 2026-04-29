import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import ApplicationGroupPage from '../pages/applicationGroup'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Application Group Page', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }

    await signIn()
    await page.goto('/log/group')
    await page.locator('#prison-number').fill('A1234AA')
    await page.locator('#prisoner-lookup-button').evaluate(element => {
      const input = element as HTMLInputElement
      input.value = 'true'
    })
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(/\/log\/group$/)
  })

  test('should display the correct page title', async ({ page }) => {
    const applicationGroupPage = new ApplicationGroupPage(page)
    await applicationGroupPage.assertBrowserTitleContains('Select application group')
  })

  test('should display the back link', async ({ page }) => {
    const applicationGroupPage = new ApplicationGroupPage(page)
    await expect(applicationGroupPage.backLink()).toBeVisible()
    await expect(applicationGroupPage.backLink()).toHaveText('Back')
  })

  test('should display radio buttons for application groups', async ({ page }) => {
    const applicationGroupPage = new ApplicationGroupPage(page)
    await expect(applicationGroupPage.radioButtons().first()).toBeVisible()
    await expect(applicationGroupPage.radioButtons()).toHaveCount(1)
  })

  test('should display Pin Phone Contact Apps group option', async ({ page }) => {
    const applicationGroupPage = new ApplicationGroupPage(page)
    await expect(applicationGroupPage.pinPhoneContactAppsLabel()).toBeVisible()
  })

  test('should show validation error when no group selected', async ({ page }) => {
    const applicationGroupPage = new ApplicationGroupPage(page)
    await applicationGroupPage.submitButton().click()

    await expect(applicationGroupPage.errorSummary()).toContainText('Choose one application group')
    await expect(applicationGroupPage.errorMessage()).toContainText('Choose one application group')
  })

  test('should successfully select a group and redirect to application type', async ({ page, selectGroup }) => {
    await new ApplicationGroupPage(page).checkOnPage()
    await selectGroup('Pin Phone Contact Apps')

    await expect(page).toHaveURL(/\/log\/application-type$/)
  })
})
