import { test, expect } from '../fixtures'
import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import { app, appTypes } from '../../server/testData'
import ActionAndReplyPage from '../pages/actionAndReply'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

Object.values(appTypes).forEach(({ id, name }) => {
  const pendingApplication = { ...app, status: APPLICATION_STATUS.PENDING, applicationType: { id, name } }
  const closedApplication = { ...app, status: APPLICATION_STATUS.APPROVED, applicationType: { id, name } }

  test.describe(`Action and Reply Page - AppType: ${id} | Status: pending`, () => {
    test.beforeEach(async ({ page, signIn }) => {
      if (isWiremock) {
        await resetStubs()
        await auth.stubSignIn()
        await prisonApi.stubGetCaseLoads()
        await managingPrisonerAppsApi.stubGetPrisonerApp({ app: pendingApplication })
        await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        await managingPrisonerAppsApi.stubGetAppResponse({ app: pendingApplication, decision: undefined })
      }

      await signIn()
      await page.goto(`/applications/${pendingApplication.requestedBy.username}/${pendingApplication.id}/reply`)
    })

    test('should display the correct page title', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await actionAndReplyPage.checkOnPage()
      await actionAndReplyPage.assertBrowserTitleContains('Action and reply')
    })

    test('should display the correct app type name', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await expect(actionAndReplyPage.caption()).toContainText(name)
    })

    test('should display the correct form elements', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await expect(actionAndReplyPage.actionRadios()).toBeVisible()
      await expect(actionAndReplyPage.reasonInput()).toBeVisible()
      await expect(actionAndReplyPage.saveButton()).toBeVisible()
      await expect(actionAndReplyPage.saveButton()).toContainText('Save')
    })

    test('should validate action and reason before submission', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await actionAndReplyPage.saveButton().click()
      await expect(actionAndReplyPage.errorSummary()).toContainText('Select an action')

      await actionAndReplyPage.selectAction('DECLINED').check()
      await actionAndReplyPage.reasonInput().clear()
      await actionAndReplyPage.saveButton().click()
      await expect(actionAndReplyPage.errorSummary()).toContainText('Add a reason')
    })

    test('should successfully submit with APPROVED decision', async ({ page }) => {
      if (isWiremock) {
        await managingPrisonerAppsApi.stubAddAppResponse({ app: pendingApplication, decision: 'APPROVED' })
      }

      const actionAndReplyPage = new ActionAndReplyPage(page)
      await actionAndReplyPage.selectAction('APPROVED').check()
      await actionAndReplyPage.saveButton().click()
      await expect(page).toHaveURL(
        new RegExp(`/applications/${pendingApplication.requestedBy.username}/${pendingApplication.id}/reply`),
      )
    })

    test('should successfully submit with DECLINED decision and reason', async ({ page }) => {
      if (isWiremock) {
        await managingPrisonerAppsApi.stubAddAppResponse({
          app: pendingApplication,
          decision: 'DECLINED',
          reason: 'Application does not meet the required criteria',
        })
      }

      const actionAndReplyPage = new ActionAndReplyPage(page)
      await actionAndReplyPage.selectAction('DECLINED').check()
      await actionAndReplyPage.reasonInput().fill('Application does not meet the required criteria')
      await actionAndReplyPage.saveButton().click()
      await expect(page).toHaveURL(
        new RegExp(`/applications/${pendingApplication.requestedBy.username}/${pendingApplication.id}/reply`),
      )
    })
  })

  test.describe(`Action and Reply Page - AppType: ${id} | Status: closed`, () => {
    test.beforeEach(async ({ page, signIn }) => {
      if (isWiremock) {
        await resetStubs()
        await auth.stubSignIn()
        await prisonApi.stubGetCaseLoads()
        await managingPrisonerAppsApi.stubGetPrisonerApp({ app: closedApplication })
        await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        await managingPrisonerAppsApi.stubGetAppResponse({ app: closedApplication, decision: 'APPROVED' })
      }

      await signIn()
      await page.goto(`/applications/${closedApplication.requestedBy.username}/${closedApplication.id}/reply`)
    })

    test('should display the correct page title', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await actionAndReplyPage.assertBrowserTitleContains('Action and reply')
    })

    test('should display the correct app type name', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await expect(actionAndReplyPage.caption()).toContainText(name)
    })

    test('should display the correct summary list', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await expect(actionAndReplyPage.summaryList()).toBeVisible()
      await expect(actionAndReplyPage.summaryListKeys()).toContainText(['Action', 'Reason', 'Date', 'Location'])
      await expect(actionAndReplyPage.summaryListValues().first()).toBeVisible()
    })

    test('should trigger window print when Print reply button is clicked', async ({ page }) => {
      const actionAndReplyPage = new ActionAndReplyPage(page)
      await expect(actionAndReplyPage.printButton()).toBeVisible()

      await page.evaluate(() => {
        ;(window as unknown as { printCalledCount: number }).printCalledCount = 0
        window.print = () => {
          ;(window as unknown as { printCalledCount: number }).printCalledCount += 1
        }
      })

      await actionAndReplyPage.printButton().click()
      const printCalled = await page.evaluate(
        () => (window as unknown as { printCalledCount: number }).printCalledCount,
      )
      expect(printCalled).toBe(1)
    })
  })
})
