import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import applicationTypesFixture from '../fixtures/applicationTypes.json'
import ApplicationTypePage from '../pages/applicationTypePage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Application Type Page', () => {
  test.beforeEach(async ({ page, signIn, enterPrisonerDetails, selectGroup }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }

    await signIn()
    await page.goto('/log/prisoner-details')
    await enterPrisonerDetails()
    await selectGroup('Pin Phone Contact Apps')
    await page.goto('/log/application-type')
  })

  test('should display the correct page title', async ({ page }) => {
    const applicationTypePage = new ApplicationTypePage(page)
    await expect(page).toHaveTitle(/Select application type/)
    await applicationTypePage.checkOnPage()
  })

  test('should display the back link', async ({ page }) => {
    const applicationTypePage = new ApplicationTypePage(page)
    await expect(applicationTypePage.backLink()).toBeVisible()
  })

  test('should display radio buttons with correct names and values', async ({ page }) => {
    const applicationTypePage = new ApplicationTypePage(page)
    const { applicationTypes } = applicationTypesFixture

    const radioButtons = applicationTypePage.radioButton()
    await expect(radioButtons).toHaveCount(applicationTypes.length)

    // Verify first and last application type
    const first = applicationTypes[0]
    const last = applicationTypes[applicationTypes.length - 1]

    const firstRadio = applicationTypePage.radioButton().nth(0)
    await expect(firstRadio.locator('label')).toContainText(first.name)
    await expect(firstRadio.locator('input')).toHaveAttribute('value', String(first.id))

    const lastRadio = applicationTypePage.radioButton().nth(applicationTypes.length - 1)
    await expect(lastRadio.locator('label')).toContainText(last.name)
    await expect(lastRadio.locator('input')).toHaveAttribute('value', String(last.id))
  })

  test('should display a divider with text "or" between radio options', async ({ page }) => {
    const applicationTypePage = new ApplicationTypePage(page)
    await expect(applicationTypePage.radioButtonOrDivider()).toContainText('or')
  })

  test('should display the continue button', async ({ page }) => {
    const applicationTypePage = new ApplicationTypePage(page)
    await expect(applicationTypePage.continueButton()).toBeVisible()
    await expect(applicationTypePage.continueButton()).toContainText('Continue')
  })

  test('should display validation error when no option is selected', async ({ page }) => {
    const applicationTypePage = new ApplicationTypePage(page)
    await applicationTypePage.continueToNextPage()

    await expect(applicationTypePage.errorSummary()).toContainText('Choose one application type')
    await expect(applicationTypePage.errorMessage()).toContainText('Choose one application type')
  })

  test('should select an application type and navigate to department', async ({ page }) => {
    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetDepartments({ appType: 3 })
    }

    const applicationTypePage = new ApplicationTypePage(page)
    await applicationTypePage.selectApplicationType('Add a social PIN phone contact')
    await applicationTypePage.continueToNextPage()

    await expect(page).toHaveURL(/\/log\/department/)
  })
})
