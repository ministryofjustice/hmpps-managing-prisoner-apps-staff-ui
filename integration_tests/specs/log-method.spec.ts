import type { Page } from '@playwright/test'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

const navigateToMethodPage = async ({
  page,
  signIn,
  enterPrisonerDetails,
  selectGroup,
  selectApplicationType,
  selectDepartment,
}: {
  page: Page
  signIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
  selectDepartment: (departmentName: string) => Promise<void>
}) => {
  await signIn()
  await page.goto('/log/prisoner-details')
  await enterPrisonerDetails()
  await selectGroup('Pin Phone Contact Apps')
  await selectApplicationType('Make a general PIN phone enquiry')
  await selectDepartment('Business Hub')

  await expect(page).toHaveURL(/\/log\/method/)
}

test.describe('Logging Method Page', () => {
  test.beforeEach(
    async ({ page, signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment }) => {
      if (isWiremock) {
        await resetStubs()
        await auth.stubSignIn()
        await prisonApi.stubGetCaseLoads('HMI')
        await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
        await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        await managingPrisonerAppsApi.stubGetDepartments({ appType: 7 })
      }

      await navigateToMethodPage({
        page,
        signIn,
        enterPrisonerDetails,
        selectGroup,
        selectApplicationType,
        selectDepartment,
      })
    },
  )

  test('should display the correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Select method to log this application/)
    await expect(page.getByRole('heading', { name: 'Select method to log this application' })).toBeVisible()
  })

  test('should display the back link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: 'Back' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/log/department')
  })

  test('should display radio buttons for logging methods', async ({ page }) => {
    await expect(page.locator('input[name="loggingMethod"]')).toHaveCount(2)
  })

  test('should display Enter details manually option', async ({ page }) => {
    await expect(page.locator('input[name="loggingMethod"][value="manual"]')).toBeVisible()
  })

  test('should display Take a photo of the paper application option', async ({ page }) => {
    await expect(page.getByRole('radio', { name: 'Take a photo of the paper application' })).toBeVisible()
  })

  test('should show validation error when no method selected', async ({ page }) => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('.govuk-error-summary')).toContainText(
      'You need to select a method to log the application',
    )
    await expect(page.locator('.govuk-error-message')).toContainText('Select one')
  })

  test('should redirect to application details when manual is selected', async ({ page }) => {
    await page.locator('input[name="loggingMethod"][value="manual"]').check({ force: true })
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(/\/log\/application-details/)
  })

  test('should redirect to photo capture when webcam is selected', async ({ page }) => {
    await page.locator('input[name="loggingMethod"][value="webcam"]').check({ force: true })
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(/\/log\/photo-capture/)
  })
})
