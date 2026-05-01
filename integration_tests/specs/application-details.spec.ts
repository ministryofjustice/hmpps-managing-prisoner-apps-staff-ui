import { Page } from '@playwright/test'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import personalRelationshipsApi from '../mockApis/personalRelationships'
import { resetStubs } from '../mockApis/wiremock'
import ApplicationDetailsPage from '../pages/applicationDetailsPage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

type NavigationFixtures = {
  signIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
  selectDepartment: (dept: string) => Promise<void>
  selectLoggingMethod: (method: 'manual' | 'webcam') => Promise<void>
}

async function startApplication(
  page: Page,
  fixtures: NavigationFixtures,
  appName: string,
  appId: number,
  relationshipType: string,
): Promise<ApplicationDetailsPage> {
  if (isWiremock) {
    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetDepartments({ appType: appId })
    await personalRelationshipsApi.stubGetRelationships(relationshipType)
  }

  await fixtures.signIn()
  await page.goto('/log/prisoner-details')
  await page.waitForLoadState('networkidle')
  await fixtures.enterPrisonerDetails()
  await fixtures.selectGroup('Pin Phone Contact Apps')
  await fixtures.selectApplicationType(appName)
  await fixtures.selectDepartment('Business Hub')

  // Handle optional logging method step
  const currentUrl = page.url()
  if (
    currentUrl.includes('/log/method') ||
    (await page
      .locator('input[name="loggingMethod"]')
      .isVisible()
      .catch(() => false))
  ) {
    await fixtures.selectLoggingMethod('manual')
  }

  await expect(page).toHaveURL(/\/log\/application-details/, { timeout: 10000 })
  return new ApplicationDetailsPage(page)
}

// --- Generic app type (Make a general PIN phone enquiry) ---
test.describe('Application Details Page - Make a general PIN phone enquiry', () => {
  let appPage: ApplicationDetailsPage

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
      appPage = await startApplication(
        page,
        { signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod },
        'Make a general PIN phone enquiry',
        7,
        'SOCIAL_RELATIONSHIP',
      )
    },
  )

  test('should render the generic Details form', async () => {
    await expect(appPage.appTypeTitle()).toHaveText('Make a general PIN phone enquiry')
    await expect(appPage.textArea()).toBeVisible()
  })

  test('should allow entering details', async () => {
    await appPage.textArea().fill('Generic info')
    await expect(appPage.textArea()).toHaveValue('Generic info')
  })

  test('should allow submitting the generic form', async ({ page }) => {
    await appPage.textArea().fill('Log generic details')
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })
})

// --- Add emergency phone credit ---
test.describe('Application Details Page - Add emergency phone credit', () => {
  let appPage: ApplicationDetailsPage

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
      appPage = await startApplication(
        page,
        { signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod },
        'Add emergency phone credit',
        1,
        'SOCIAL_RELATIONSHIP',
      )
    },
  )

  test('should show validation errors when fields are missing', async () => {
    await appPage.continueButton().click()
    await expect(appPage.errorSummary()).toBeVisible()
    await expect(appPage.errorMessage()).toBeVisible()
  })

  test('should enter log details for emergency phone credit and proceed to check details page', async ({ page }) => {
    await appPage.fillEmergencyPhoneCredit()
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })
})

// --- Add an official PIN phone contact ---
test.describe('Application Details Page - Add an official PIN phone contact', () => {
  let appPage: ApplicationDetailsPage

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
      appPage = await startApplication(
        page,
        { signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod },
        'Add an official PIN phone contact',
        2,
        'OFFICIAL_RELATIONSHIP',
      )
    },
  )

  test('should show validation errors when fields are missing', async () => {
    await appPage.continueButton().click()
    await expect(appPage.errorSummary()).toBeVisible()
    await expect(appPage.errorMessage()).toBeVisible()
  })

  test('should enter log details for official PIN phone contact and proceed to check details page', async ({
    page,
  }) => {
    await appPage.fillOfficialPinPhoneContact()
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })
})

// --- Add a social PIN phone contact ---
test.describe('Application Details Page - Add a social PIN phone contact', () => {
  let appPage: ApplicationDetailsPage

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
      appPage = await startApplication(
        page,
        { signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod },
        'Add a social PIN phone contact',
        3,
        'SOCIAL_RELATIONSHIP',
      )
    },
  )

  test('should render the first night or early days centre radio buttons', async () => {
    await expect(appPage.firstNightOrEarlyDaysCentreLabel()).toBeVisible()
    await expect(appPage.firstNightOrEarlyDaysCentre().first()).toBeVisible()
    await expect(appPage.firstNightOrEarlyDaysCentreYes()).toBeVisible()
    await expect(appPage.firstNightOrEarlyDaysCentreNo()).toBeVisible()
  })

  test('should allow the user to select "No" for first night or early days centre', async () => {
    await appPage.firstNightOrEarlyDaysCentreNo().check({ force: true })
    await expect(appPage.firstNightOrEarlyDaysCentreNo()).toBeChecked()
  })

  test('should allow the user to select "Yes" for first night or early days centre', async () => {
    await appPage.firstNightOrEarlyDaysCentreYes().check({ force: true })
    await expect(appPage.firstNightOrEarlyDaysCentreYes()).toBeChecked()
  })

  test('should show an error if no radio button is selected for first night or early days centre', async () => {
    await appPage.continueButton().click()
    await expect(appPage.firstNightOrEarlyDaysCentreErrorMessage()).toBeVisible()
  })

  test('should display date of birth inputs when selected', async ({ page }) => {
    await page.locator('input[value="dateofbirth"]').check({ force: true })
    await expect(page.locator('#dob-day')).toBeVisible()
    await expect(page.locator('#dob-month')).toBeVisible()
    await expect(page.locator('#dob-year')).toBeVisible()
    await expect(page.locator('#dob-hint')).toContainText('For example, 7/10/2002')
  })

  test('should display age input when selected', async ({ page }) => {
    await page.locator('input[value="age"]').check({ force: true })
    await expect(page.locator('#age')).toBeVisible()
  })

  test('should show validation errors for missing required fields', async () => {
    await appPage.firstNightOrEarlyDaysCentreNo().check({ force: true })
    await appPage.continueButton().click()
    await expect(appPage.errorSummary()).toBeVisible()
    await expect(appPage.errorMessage()).toBeVisible()
  })

  test('should validate telephone number format', async () => {
    await appPage.firstNightOrEarlyDaysCentreNo().check({ force: true })
    await appPage.fillSocialContactInvalidTelephone()
    await appPage.continueButton().click()
    await expect(appPage.errorMessage()).toContainText('Enter a phone number in the correct format')
  })

  test('should enter log details for social PIN phone contact and proceed to check details page', async ({ page }) => {
    await appPage.firstNightOrEarlyDaysCentreNo().check({ force: true })
    await appPage.fillSocialPinPhoneContact()
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })
})

// --- Remove a PIN phone contact ---
test.describe('Application Details Page - Remove a PIN phone contact', () => {
  let appPage: ApplicationDetailsPage

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
      appPage = await startApplication(
        page,
        { signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod },
        'Remove a PIN phone contact',
        4,
        'SOCIAL_RELATIONSHIP',
      )
    },
  )

  test('should display "PIN phone contact to remove" text', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'PIN phone contact to remove' })).toBeVisible()
  })

  test('should show validation errors for missing required fields', async () => {
    await appPage.continueButton().click()
    await expect(appPage.errorSummary()).toBeVisible()
    await expect(appPage.errorMessage()).toBeVisible()
  })

  test('should enter log details for removing a PIN phone contact and proceed to check details page', async ({
    page,
  }) => {
    await appPage.fillRemovePinPhoneContact()
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })
})

// --- Swap Visiting Orders (VOs) for PIN Credit ---
test.describe('Application Details Page - Swap Visiting Orders (VOs) for PIN Credit', () => {
  let appPage: ApplicationDetailsPage

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
      appPage = await startApplication(
        page,
        { signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod },
        'Swap Visiting Orders (VOs) for PIN Credit',
        5,
        'SOCIAL_RELATIONSHIP',
      )
    },
  )

  test('should enter log details for swapping VOs and proceed to check details page', async ({ page }) => {
    await page.locator('textarea#details').fill('Need to swap 2 visiting orders for phone credit')
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })

  test('should allow proceeding without entering log details (optional)', async ({ page }) => {
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })

  test('should enforce character limit on details field', async ({ page }) => {
    await page.locator('textarea#details').fill('a'.repeat(1001))
    await appPage.continueButton().click()
    await expect(page.locator('.govuk-error-message').first()).toContainText('1000 characters')
  })
})

// --- Supply list of contacts ---
test.describe('Application Details Page - Supply list of contacts', () => {
  let appPage: ApplicationDetailsPage

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
      appPage = await startApplication(
        page,
        { signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod },
        'Supply list of contacts',
        6,
        'SOCIAL_RELATIONSHIP',
      )
    },
  )

  test('should enter log details for supply contact list and proceed to check details page', async ({ page }) => {
    await page.locator('textarea#details').fill('Please provide full contact list for prisoner')
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })

  test('should allow proceeding without entering log details (optional)', async ({ page }) => {
    await appPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/confirm/)
  })
})

// --- Change Application Page - Legacy company field ---
test.describe('Change Application Page - Legacy company field', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubOfficialAppTypeWithCompanyField()
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetDepartments({ appType: 2 })
      await personalRelationshipsApi.stubGetRelationships('OFFICIAL_RELATIONSHIP')
    }

    await signIn()
    await page.goto('/applications/A1234AA/official-app-id/change')
  })

  test('should pre-fill Organisation field using legacy company value', async ({ page }) => {
    await expect(page.locator('#organisation')).toHaveValue('Legacy Company Ltd')
  })
})
