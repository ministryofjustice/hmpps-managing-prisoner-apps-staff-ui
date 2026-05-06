import path from 'path'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import AddAnotherPhotoPage from '../pages/addAnotherPhotoPage'
import ConfirmDetailsPhotoPage from '../pages/confirmDetailsPhotoPage'
import ConfirmPhotoPage from '../pages/confirmPhotoPage'
import PhotoCapturePage from '../pages/photoCapturePage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')
const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg')

test.describe('Check details page - webcam flow', () => {
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

      const photoCapturePage = new PhotoCapturePage(page)
      const confirmPhotoPage = new ConfirmPhotoPage(page)
      const addAnotherPhotoPage = new AddAnotherPhotoPage(page)

      await page.goto('/log/photo-capture')
      await photoCapturePage.uploadPhotoAndSubmit(testImagePath)
      await expect(page).toHaveURL(/\/log\/confirm-photo-capture/)

      await confirmPhotoPage.saveAndContinue()
      await expect(page).toHaveURL(/\/log\/add-another-photo/)

      await addAnotherPhotoPage.selectNo()
      await addAnotherPhotoPage.continueButton().click()
      await expect(page).toHaveURL(/\/log\/additional-photo-details/)

      await page.locator('textarea').fill('Test additional details')
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page).toHaveURL(/\/log\/confirm/)
    },
  )

  test('should display check details page correctly', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPhotoPage(page)
    await confirmDetailsPage.checkOnPage()
  })

  test('should show method with change link', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPhotoPage(page)
    const row = confirmDetailsPage.rowByLabel('Method')
    await expect(row).toContainText('Take a photo of the application')
    await expect(row.getByRole('link', { name: 'Change method' })).toHaveAttribute('href', '/log/method')
  })

  test('should show Image 1 with retake and remove links', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPhotoPage(page)
    const row = confirmDetailsPage.rowByLabel('Image 1')
    await expect(row.locator('img')).toBeVisible()
    await expect(row.getByRole('link', { name: 'Retake image 1' })).toHaveAttribute(
      'href',
      '/log/photo-capture?retake=photo1',
    )
    await expect(row.getByRole('link', { name: 'Remove image 1' })).toHaveAttribute(
      'href',
      '/log/remove-photo?photo=photo1',
    )
  })

  test('should show Image 2 (optional) with upload link', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPhotoPage(page)
    const row = confirmDetailsPage.rowByLabel('Image 2 (optional)')
    await expect(row).toContainText('Not uploaded')
    await expect(row.getByRole('link', { name: 'Upload image 2' })).toHaveAttribute(
      'href',
      '/log/photo-capture?image=2',
    )
  })

  test('should show additional details with change link', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPhotoPage(page)
    const row = confirmDetailsPage.rowByLabel('Additional details')
    await expect(row).toContainText('Test additional details')
    await expect(row.getByRole('link', { name: 'Change additional details' })).toHaveAttribute(
      'href',
      '/log/additional-photo-details',
    )
  })

  test('should have enabled Submit application button', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPhotoPage(page)
    await expect(confirmDetailsPage.submitApplicationButton()).toBeEnabled()
  })

  test('should not show warning when photo is uploaded', async ({ page }) => {
    const confirmDetailsPage = new ConfirmDetailsPhotoPage(page)
    await expect(confirmDetailsPage.warningText()).toHaveCount(0)
  })
})
