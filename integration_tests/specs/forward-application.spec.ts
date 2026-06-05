import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import ForwardApplicationPage from '../pages/forwardApplicationPage'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Forward Application Page', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app })
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetDepartments({ appType: app.applicationType.id })
    }

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/forward`)
  })

  test('should display the correct page title', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)
    await expect(forwardPage.pageTitle()).toContainText('Forward this application')
  })

  test('should display department selection radios', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)
    await expect(forwardPage.departmentRadios()).toHaveCount(2)
  })

  test('should display the forwarding reason field', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)
    await expect(forwardPage.forwardingReasonField()).toBeVisible()
  })

  test('should display the submit button', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)
    await expect(forwardPage.submitButton()).toBeVisible()
    await expect(forwardPage.submitButton()).toContainText('Continue')
  })

  test('should allow selecting a department', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)
    const departments = await forwardPage.departmentRadios()
    const firstDeptRadios = departments.first()

    await firstDeptRadios.check()
    await expect(firstDeptRadios).toBeChecked()
  })

  test('should allow entering a forwarding reason', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)
    const reason = 'Forwarding to process application'

    await forwardPage.enterForwardingReason(reason)
    await expect(forwardPage.forwardingReasonField()).toHaveValue(reason)
  })

  test('should forward application with department and reason', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)

    if (isWiremock) {
      await managingPrisonerAppsApi.stubForwardApp({ applicationId: app.id })
    }

    const departments = await forwardPage.departmentRadios()
    const firstDept = departments.first()
    const deptValue = await firstDept.getAttribute('value')

    await forwardPage.selectDepartment(deptValue)
    await forwardPage.enterForwardingReason('Test forwarding reason')
    await forwardPage.submit()

    await expect(page).toHaveURL(`${targetBaseUrl}/applications/${app.requestedBy.username}/${app.id}`)
  })

  test('should show validation error when forwarding reason exceeds 1000 characters', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)
    const longReason = 'a'.repeat(1001)

    const departments = await forwardPage.departmentRadios()
    const firstDept = departments.first()
    const deptValue = await firstDept.getAttribute('value')

    await forwardPage.selectDepartment(deptValue)
    await forwardPage.enterForwardingReason(longReason)
    await forwardPage.submit()

    await expect(forwardPage.getErrorSummary()).toBeVisible()
  })

  test('should allow forwarding without a reason', async ({ page }) => {
    const forwardPage = new ForwardApplicationPage(page)

    if (isWiremock) {
      await managingPrisonerAppsApi.stubForwardApp({ applicationId: app.id })
    }

    const departments = await forwardPage.departmentRadios()
    const firstDept = departments.first()
    const deptValue = await firstDept.getAttribute('value')

    await forwardPage.selectDepartment(deptValue)
    await forwardPage.submit()

    await expect(page).toHaveURL(`${targetBaseUrl}/applications/${app.requestedBy.username}/${app.id}`)
  })
})
