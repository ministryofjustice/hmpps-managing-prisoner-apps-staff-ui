import path from 'path'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import AddAnotherPhotoPage from '../pages/addAnotherPhotoPage'
import ConfirmPhotoPage from '../pages/confirmPhotoPage'
import PhotoCapturePage from '../pages/photoCapturePage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')
const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg')

test.describe('Confirm Photo Capture Page', () => {
  test.beforeEach(
    async ({ page, signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod }) => {
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
    },
  )

  test('should redirect to photo capture if no photo in session', async ({ page }) => {
    await page.goto('/log/confirm-photo-capture')
    await expect(page).toHaveURL(/\/log\/photo-capture/)
  })

  test.describe('with photo in session', () => {
    test.beforeEach(async ({ page }) => {
      const photoCapturePage = new PhotoCapturePage(page)
      await page.goto('/log/photo-capture')
      await photoCapturePage.uploadPhotoAndSubmit(testImagePath)
      await expect(page).toHaveURL(/\/log\/confirm-photo-capture/)
    })

    test('should display the correct page content', async ({ page }) => {
      const confirmPhotoPage = new ConfirmPhotoPage(page)
      await expect(page).toHaveTitle(/Confirm image/)
      await confirmPhotoPage.checkOnPage()
      await expect(confirmPhotoPage.caption()).toContainText('Make a general PIN phone enquiry')
      await expect(confirmPhotoPage.editInstructions()).toContainText('Edit the image before continuing')
      await expect(confirmPhotoPage.photoPreview()).toBeAttached()
      await expect(confirmPhotoPage.previewButton()).toBeVisible()
      await expect(confirmPhotoPage.saveAndContinueButton()).toBeVisible()
    })

    test('should allow adding a second photo and go to additional details page', async ({ page }) => {
      const confirmPhotoPage = new ConfirmPhotoPage(page)
      const addAnotherPhotoPage = new AddAnotherPhotoPage(page)
      const photoCapturePage = new PhotoCapturePage(page)

      await confirmPhotoPage.saveAndContinue()
      await expect(page).toHaveURL(/\/log\/add-another-photo/)

      await addAnotherPhotoPage.selectYes()
      await addAnotherPhotoPage.continueButton().click()
      await expect(page).toHaveURL(/\/log\/photo-capture/)

      await photoCapturePage.uploadPhotoAndSubmit(testImagePath)
      await expect(page).toHaveURL(/\/log\/confirm-photo-capture/)

      await confirmPhotoPage.saveAndContinue()
      await expect(page).toHaveURL(/\/log\/additional-photo-details/)
    })

    test('should navigate to additional details when selecting No on add another photo', async ({ page }) => {
      const confirmPhotoPage = new ConfirmPhotoPage(page)
      const addAnotherPhotoPage = new AddAnotherPhotoPage(page)

      await confirmPhotoPage.saveAndContinue()
      await expect(page).toHaveURL(/\/log\/add-another-photo/)

      await addAnotherPhotoPage.selectNo()
      await addAnotherPhotoPage.continueButton().click()
      await expect(page).toHaveURL(/\/log\/additional-photo-details/)
    })

    test('should show validation error if no option is selected on add another photo page', async ({ page }) => {
      const confirmPhotoPage = new ConfirmPhotoPage(page)
      const addAnotherPhotoPage = new AddAnotherPhotoPage(page)

      await confirmPhotoPage.saveAndContinue()
      await expect(page).toHaveURL(/\/log\/add-another-photo/)

      await addAnotherPhotoPage.continueButton().click()
      await expect(addAnotherPhotoPage.errorSummary()).toContainText(
        'You need to select if you want to take another photo of the application.',
      )
      await expect(page.locator('#addAnotherPhoto-error')).toContainText('Select one')
    })
  })
})
