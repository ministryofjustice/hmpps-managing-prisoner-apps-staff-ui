import path from 'path'
import { test, expect } from '../fixtures'
import auth from '../../mockApis/auth'
import managingPrisonerAppsApi from '../../mockApis/managingPrisonerApps'
import prisonApi from '../../mockApis/prison'
import { resetStubs } from '../../mockApis/wiremock'
import Page from '../pages/page'
import AdditionalPhotoDetailsPage from '../pages/additionalPhotoDetails'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

const testImagePath = path.join(__dirname, '../../fixtures/test-image.jpg')

test.describe('Additional Photo Details Page', () => {
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
        await managingPrisonerAppsApi.stubGetDepartments({ appType: 7 })
      }

      await signIn()
      await page.goto('/log/prisoner-details')
      await enterPrisonerDetails()
      await selectGroup('Pin Phone Contact Apps')
      await selectApplicationType('Make a general PIN phone enquiry')
      await selectDepartment('Business Hub')
      await selectLoggingMethod('webcam')

      await page.goto('/log/photo-capture')
      await page.setInputFiles('input[type="file"]', testImagePath)

      // Submit form and wait for navigation to confirm-photo-capture
      await page.locator('form').evaluate(f => (f as HTMLFormElement).submit())
      await page.waitForURL(/\/log\/confirm-photo-capture/, { timeout: 10000 })

      // Click "Save and continue" to proceed to add-another-photo
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await page.waitForURL(/\/log\/add-another-photo/, { timeout: 10000 })

      // Select "No" for adding another photo
      await page.locator('input[value="no"]').check({ force: true })
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(page).toHaveURL(/\/log\/additional-photo-details/, { timeout: 10000 })
    },
  )

  test('should display correct page content', async ({ page }) => {
    const additionalPhotoDetailsPage = await Page.verifyOnPage(AdditionalPhotoDetailsPage, page)
    await expect(additionalPhotoDetailsPage.heading()).toContainText('Enter additional details')
    await expect(additionalPhotoDetailsPage.caption()).toContainText('Make a general PIN phone enquiry')
    await expect(additionalPhotoDetailsPage.detailsLabel()).toContainText(
      'Add additional details about this application (optional)',
    )
    await expect(additionalPhotoDetailsPage.textArea()).toBeVisible()
    await expect(additionalPhotoDetailsPage.continueButton()).toBeVisible()
  })

  test('should show validation error when details exceed max length', async ({ page }) => {
    await page.locator('#additionalDetails').fill('a'.repeat(1001))
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('.govuk-error-summary')).toBeVisible()
  })
})
