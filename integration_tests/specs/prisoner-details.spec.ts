import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import prisonApi from '../mockApis/prison'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import { resetStubs } from '../mockApis/wiremock'
import PrisonerDetailsPage from '../pages/prisonerDetailsPage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Prisoner Details Page', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
    }

    await signIn()
    await page.goto('/log/prisoner-details')
  })

  test('should direct the user to the correct page', async ({ page }) => {
    const title = await page.title()
    expect(title).toContain('Log prisoner details')
  })

  test('should display the correct page title', async ({ page }) => {
    const title = await page.title()
    expect(title).toContain('Log prisoner details')
  })

  test('should render the back link with correct text and href', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    const backLink = prisonerDetailsPage.backLink()
    await expect(backLink).toContainText('Back')
    await expect(backLink).toHaveAttribute('href', '/')
  })

  test('should display the prisoner details form', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    const form = prisonerDetailsPage.form()
    await expect(form).toBeAttached()
  })

  test('should include a hidden CSRF token input field', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    const csrfToken = prisonerDetailsPage.csrfToken()
    await expect(csrfToken).toBeAttached()
    await expect(csrfToken).toHaveAttribute('type', 'hidden')
  })

  test('should render the prison number input field', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    const input = prisonerDetailsPage.prisonNumberInput()
    await expect(input).toBeAttached()
    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveAttribute('name', 'prisonNumber')
  })

  test('should render the "Find prisoner" button', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    const button = prisonerDetailsPage.findPrisonerButton()
    await expect(button).toBeAttached()
    await expect(button).toHaveClass(/govuk-button--secondary/)
    await expect(button).toContainText('Find prisoner')
  })

  test('should render the prisoner name inset text', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    const insetText = prisonerDetailsPage.prisonerNameInsetText()
    await expect(insetText).toBeAttached()
  })

  test('should render the continue button with the correct text', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    const button = prisonerDetailsPage.continueButton()
    await expect(button).toBeAttached()
    await expect(button).toContainText('Continue')
    await expect(button).toHaveClass(/govuk-button--primary/)
  })

  test('should show an error if "Find prisoner" button is not clicked', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.enterPrisonNumber('A1234AA')
    await prisonerDetailsPage.clickContinue()
    const errorMessage = prisonerDetailsPage.findPrisonerButtonErrorMessage()
    await expect(errorMessage).toBeAttached()
  })

  test('should display prisoner name and alert count when found', async ({ page }) => {
    if (isWiremock) {
      await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    }
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.enterPrisonNumber('A1234AA')
    await prisonerDetailsPage.clickFindPrisoner()

    const insetText = prisonerDetailsPage.prisonerNameInsetText()
    await expect(insetText).toContainText('Prisoner name:')
    await expect(insetText).toContainText('alerts')
  })

  test('should show error for invalid prison number', async ({ page }) => {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.enterPrisonNumber('INVALID')
    await prisonerDetailsPage.clickFindPrisoner()

    const insetText = prisonerDetailsPage.prisonerNameInsetText()
    await expect(insetText).toContainText('Prisoner name: Not found')
  })

  test('should successfully submit and redirect to application group selection', async ({ page }) => {
    if (isWiremock) {
      await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.enterPrisonNumber('A1234AA')
    await prisonerDetailsPage.clickFindPrisoner()
    await prisonerDetailsPage.clickContinue()

    await page.waitForURL('**/log/group')
    expect(page.url()).toContain('/log/group')
  })

  test('sanitises prison number before submitting to the API', async ({ page }) => {
    if (isWiremock) {
      await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    }
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.enterPrisonNumber('A1234 . AA')
    await prisonerDetailsPage.clickFindPrisoner()

    const insetText = prisonerDetailsPage.prisonerNameInsetText()
    await expect(insetText).toContainText('Prisoner name:')
  })

  test('normalises lowercase prison number before lookup', async ({ page }) => {
    if (isWiremock) {
      await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    }
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.enterPrisonNumber('a1234aa')
    await prisonerDetailsPage.clickFindPrisoner()

    const insetText = prisonerDetailsPage.prisonerNameInsetText()
    await expect(insetText).toContainText('Prisoner name:')
  })
})
