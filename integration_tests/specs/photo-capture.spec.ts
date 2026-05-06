import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import PhotoCapturePage from '../pages/photoCapturePage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Photo Capture Page', () => {
  test.beforeEach(
    async ({ page, signIn, enterPrisonerDetails, selectGroup, selectApplicationType, selectDepartment, selectLoggingMethod }) => {
      if (isWiremock) {
        await resetStubs()
        await auth.stubSignIn()
        await prisonApi.stubGetCaseLoads()
        await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
        await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        await managingPrisonerAppsApi.stubGetDepartments({ appType: 3 })
      }

      await signIn()
      await page.goto('/log/prisoner-details')
      await enterPrisonerDetails()
      await selectGroup('Pin Phone Contact Apps')
      await selectApplicationType('Add a social PIN phone contact')
      await selectDepartment('Business Hub')
      await page.goto('/log/method')
      await selectLoggingMethod('webcam')
      await page.goto('/log/photo-capture')
    },
  )

  test('should display the correct page title', async ({ page }) => {
    const photoCapturePage = new PhotoCapturePage(page)
    await expect(page).toHaveTitle(/Take a photo of the application/)
    await photoCapturePage.checkOnPage()
  })

  test('should display the back link', async ({ page }) => {
    const photoCapturePage = new PhotoCapturePage(page)
    await expect(photoCapturePage.backLink()).toBeVisible()
  })

  test('should display photo instructions', async ({ page }) => {
    const photoCapturePage = new PhotoCapturePage(page)
    await expect(photoCapturePage.instructions()).toContainText('Place the paper flat on a clear desk.')
    await expect(photoCapturePage.instructions()).toContainText('Select "Take photo".')
  })

  test('should include a CSRF token', async ({ page }) => {
    const photoCapturePage = new PhotoCapturePage(page)
    await expect(photoCapturePage.csrfToken()).toHaveCount(1)
  })

  test('should display webcam error message content', async ({ page }) => {
    const photoCapturePage = new PhotoCapturePage(page)
    const errorPanel = photoCapturePage.webcamErrorPanel()
    await expect(errorPanel).toContainText('Your computer cannot access the webcam')
    await expect(errorPanel).toContainText('open your browser\u2019s settings and look for camera permissions to allow the request')
    await expect(errorPanel).toContainText('check the webcam is connected to the computer you\u2019re using')
    await expect(errorPanel).toContainText('If you cannot resolve the issue')
    await expect(errorPanel).toContainText('Call the helpdesk')
    await expect(errorPanel).toContainText('#6598')
    await expect(errorPanel).toContainText('0800 917 5148')
  })
})
