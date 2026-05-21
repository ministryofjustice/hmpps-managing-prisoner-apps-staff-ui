import { Page } from '@playwright/test'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import ConfirmDetailsPage from '../pages/confirmDetailsPage'
import { app } from '../../server/testData'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

type NavigationFixtures = {
  signIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
  selectDepartment: (departmentName: string) => Promise<void>
  selectLoggingMethod: (method: 'manual' | 'webcam') => Promise<void>
}

const prepareNewApplication = async ({
  page,
  signIn,
  enterPrisonerDetails,
  selectGroup,
  selectApplicationType,
  selectDepartment,
  selectLoggingMethod,
}: { page: Page } & NavigationFixtures) => {
  await signIn()
  await page.goto('/log/prisoner-details')
  await page.waitForLoadState('networkidle')
  await enterPrisonerDetails()
  await selectGroup('Pin Phone Contact Apps')
  await selectApplicationType('Swap Visiting Orders (VOs) for PIN Credit')
  await selectDepartment('Business Hub')
  await selectLoggingMethod('manual')

  await page.waitForLoadState('networkidle')

  const applicationDetailsPage = new ApplicationDetailsPage(page)
  await applicationDetailsPage.continueButton().click()
  await expect(page).toHaveURL(/\/log\/confirm/)
}

test.describe('Confirm Details Page - new application', () => {
  test.beforeEach(
    async ({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      selectDepartment,
      selectLoggingMethod,
    }) => {
      if (isWiremock) {
        await resetStubs()
        await auth.stubSignIn()
        await prisonApi.stubGetCaseLoads()
        await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
        await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        await managingPrisonerAppsApi.stubGetDepartments({ appType: 5 })
      }

      await prepareNewApplication({
        page,
        signIn,
        enterPrisonerDetails,
        selectGroup,
        selectApplicationType,
        selectDepartment,
        selectLoggingMethod,
      })
    },
  )

  test('should display the correct page title', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    const title = await page.title()
    expect(title).toContain('Swap Visiting Orders (VOs) for PIN Credit')
    await confirmDetailsPage.checkOnPage()
  })

  test('should render the back link with correct text and href', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.backLink()).toContainText('Back')
    await expect(confirmDetailsPage.backLink()).toHaveAttribute('href', '/log/application-details')
  })

  test('should render the application type summary with correct text', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.applicationTypeSummary()).toContainText('Application type')
    await expect(confirmDetailsPage.applicationTypeSummary()).toContainText('Swap Visiting Orders (VOs) for PIN Credit')
  })

  test('should allow changing the application type', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.changeApplicationTypeLink()).toHaveAttribute('href', '/log/application-type')
  })

  test('should render prisoner name summary with correct text', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.prisonerSummary()).toContainText('Prisoner')
    await expect(confirmDetailsPage.prisonerSummary()).toContainText('A1234AA')
  })

  test('should render a Submit application button with the correct text', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.submitApplicationButton()).toBeVisible()
    await expect(confirmDetailsPage.submitApplicationButton()).toContainText('Submit application')
  })

  test('should successfully submit the application and redirect', async ({ page }) => {
    const submittedApp = {
      ...app,
      id: '13d2c453-be11-44a8-9861-21fd8ae6e911',
      requestedBy: { ...app.requestedBy, username: 'A1234AA' },
      applicationType: { id: 5, name: 'Swap Visiting Orders (VOs) for PIN Credit' },
    }

    if (isWiremock) {
      await managingPrisonerAppsApi.stubSubmitPrisonerApp({ app: submittedApp })
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: submittedApp })
    }

    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await confirmDetailsPage.submitApplicationButton().click()

    await expect(page).toHaveURL(/\/log\/submit\/A1234AA\//)
  })

  test('should display the cancel link', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.cancelLink()).toHaveAttribute('href', '/log/cancel')
  })

  test('should clear session data and redirect to home page when cancel is clicked', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await confirmDetailsPage.cancelLink().click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('should allow starting a fresh application after cancellation', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
  }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await confirmDetailsPage.cancelLink().click()
    await expect(page).toHaveURL(/\/$/)

    if (isWiremock) {
      await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    }

    await signIn()
    await page.goto('/log/prisoner-details')
    await enterPrisonerDetails()
    await selectGroup('Pin Phone Contact Apps')
    await selectApplicationType('Swap Visiting Orders (VOs) for PIN Credit')

    await expect(page).toHaveURL(/\/log\/department/)
  })
})

test.describe('Confirm Details Page - existing application update', () => {
  const changeApp = {
    ...app,
    appType: app.appType,
    applicationType: { id: 5, name: 'Swap Visiting Orders (VOs) for PIN Credit' },
  }

  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: changeApp })
      await managingPrisonerAppsApi.stubGetHistory({ app: changeApp })
      await managingPrisonerAppsApi.stubGetAppResponse({ app: changeApp })
    }

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/change`)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(/\/applications\/.*\/change\/confirm/)
  })

  test('should display the correct page title', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    const title = await page.title()
    expect(title).toContain('Swap Visiting Orders (VOs) for PIN Credit')
    await confirmDetailsPage.checkOnPage()
  })

  test('should render the back link with correct text and href', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.backLink()).toContainText('Back')
    await expect(confirmDetailsPage.backLink()).toHaveAttribute(
      'href',
      `/applications/${app.requestedBy.username}/${app.id}/change`,
    )
  })

  test('should render the application type summary with correct text', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.applicationTypeSummary()).toContainText('Swap Visiting Orders (VOs) for PIN Credit')
  })

  test('should not allow changing the application type', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.changeApplicationTypeLink()).toHaveCount(0)
  })

  test('should render prisoner name summary with correct text', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.prisonerSummary()).toContainText('Prisoner')
    await expect(confirmDetailsPage.prisonerSummary()).toContainText('Emily Brown')
  })

  test('should render a Save button with the correct text', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.saveButton()).toBeVisible()
    await expect(confirmDetailsPage.saveButton()).toContainText('Save')
  })

  test('should successfully submit the update and redirect', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await confirmDetailsPage.saveButton().click()

    await expect(page).toHaveURL(/\/applications\/G123456\/13d2c453-be11-44a8-9861-21fd8ae6e911\/change\/submit/)
  })
})
