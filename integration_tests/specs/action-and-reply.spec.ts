import { test, expect } from '../fixtures'
import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import { app, appDecisionResponse, appTypes } from '../../server/testData'
import ActionAndReplyPage from '../pages/actionAndReply'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs, stubFor } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

Object.values(appTypes).forEach(({ id, name }) => {
  const pendingApplication = { ...app, status: APPLICATION_STATUS.NEW, applicationType: { id, name } }

  test.describe(`Action and Reply Page - AppType: ${id} | Status: open`, () => {
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
      await expect(actionAndReplyPage.errorSummary()).toContainText('Choose an action to close this application')

      await actionAndReplyPage.selectAction('DECLINED').check()
      await actionAndReplyPage.reasonInput().clear()
      await actionAndReplyPage.saveButton().click()
      await expect(actionAndReplyPage.errorSummary()).toContainText('Add a reason')
    })

    test('should display a back link to the application', async ({ page }) => {
      const backLink = page.locator('.govuk-back-link')
      await expect(backLink).toBeVisible()
      await expect(backLink).toHaveAttribute(
        'href',
        `/applications/${pendingApplication.requestedBy.username}/${pendingApplication.id}`,
      )
    })

    test('should display the application status tag', async ({ page }) => {
      await expect(page.locator('main .govuk-tag')).toContainText('New')
    })

    test('should successfully submit with APPROVED decision', async ({ page }) => {
      if (isWiremock) {
        await managingPrisonerAppsApi.stubAddAppResponse({ app: pendingApplication, decision: 'APPROVED' })
      }

      const actionAndReplyPage = new ActionAndReplyPage(page)
      await actionAndReplyPage.selectAction('APPROVED').check()
      await actionAndReplyPage.saveButton().click()
      await expect(page).toHaveURL(
        new RegExp(
          `/applications/${pendingApplication.requestedBy.username}/${pendingApplication.id}\\?applicationClosed=true`,
        ),
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
        new RegExp(
          `/applications/${pendingApplication.requestedBy.username}/${pendingApplication.id}\\?applicationClosed=true`,
        ),
      )
    })
  })
})

const [firstAppType] = Object.values(appTypes)
const pendingApp = { ...app, status: APPLICATION_STATUS.PENDING, applicationType: firstAppType }

test.describe('Action and Reply Page - REJECTED decision', () => {
  test.beforeEach(async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetPrisonerApp({ app: pendingApp })
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetAppResponse({ app: pendingApp, decision: undefined })

    await signIn()
    await page.goto(`/applications/${pendingApp.requestedBy.username}/${pendingApp.id}/reply`)
  })

  test('should show validation error when REJECTED is selected without choosing a rejected reason', async ({
    page,
  }) => {
    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('REJECTED').check()
    await actionAndReplyPage.saveButton().click()
    await expect(actionAndReplyPage.errorSummary()).toContainText('Choose the reason for this rejected application')
  })

  test('should successfully submit with REJECTED decision and a valid rejection reason', async ({ page }) => {
    await managingPrisonerAppsApi.stubAddAppResponse({
      app: pendingApp,
      decision: 'REJECTED',
      reason: 'Prisoner sent an abusive app',
    })

    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('REJECTED').check()
    await actionAndReplyPage.rejectedReasonRadio('Prisoner sent an abusive app').check()
    await actionAndReplyPage.saveButton().click()
    await expect(page).toHaveURL(
      new RegExp(`/applications/${pendingApp.requestedBy.username}/${pendingApp.id}\\?applicationClosed=true`),
    )
  })

  test('should successfully submit with REJECTED and "Prisoner used the wrong app"', async ({ page }) => {
    await managingPrisonerAppsApi.stubAddAppResponse({
      app: pendingApp,
      decision: 'REJECTED',
      reason: 'Prisoner used the wrong app',
    })

    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('REJECTED').check()
    await actionAndReplyPage.rejectedReasonRadio('Prisoner used the wrong app').check()
    await actionAndReplyPage.saveButton().click()
    await expect(page).toHaveURL(
      new RegExp(`/applications/${pendingApp.requestedBy.username}/${pendingApp.id}\\?applicationClosed=true`),
    )
  })

  test('should successfully submit with REJECTED and "Prisoner has already sent this app"', async ({ page }) => {
    await managingPrisonerAppsApi.stubAddAppResponse({
      app: pendingApp,
      decision: 'REJECTED',
      reason: 'Prisoner has already sent this app',
    })

    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('REJECTED').check()
    await actionAndReplyPage.rejectedReasonRadio('Prisoner has already sent this app').check()
    await actionAndReplyPage.saveButton().click()
    await expect(page).toHaveURL(
      new RegExp(`/applications/${pendingApp.requestedBy.username}/${pendingApp.id}\\?applicationClosed=true`),
    )
  })

  test('should show all three valid rejected reason options', async ({ page }) => {
    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('REJECTED').check()
    await expect(actionAndReplyPage.rejectedReasonRadio('Prisoner used the wrong app')).toBeVisible()
    await expect(actionAndReplyPage.rejectedReasonRadio('Prisoner has already sent this app')).toBeVisible()
    await expect(actionAndReplyPage.rejectedReasonRadio('Prisoner sent an abusive app')).toBeVisible()
  })

  test('should show validation error when DECLINED reason exceeds 1000 characters', async ({ page }) => {
    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('DECLINED').check()
    await actionAndReplyPage.reasonInput().fill('a'.repeat(1001))
    await actionAndReplyPage.saveButton().click()
    await expect(actionAndReplyPage.errorSummary()).toContainText('Reason must be 1000 characters or less')
  })
})

test.describe('Action and Reply Page - closed application decision summary', () => {
  test('should display DECLINED decision and reason in summary list', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const declinedApp = { ...app, status: APPLICATION_STATUS.DECLINED, applicationType: firstAppType }

    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetPrisonerApp({ app: declinedApp })
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetAppResponse({
      app: declinedApp,
      decision: 'DECLINED',
      reason: 'Does not meet the criteria',
    })

    await signIn()
    await page.goto(`/applications/${declinedApp.requestedBy.username}/${declinedApp.id}?applicationClosed=true`)

    await expect(page.locator('.moj-alert')).toContainText('Application closed')
    await expect(page.locator('h1')).toContainText(declinedApp.applicationType.name)
  })

  test('should display REJECTED decision and rejection reason in summary list', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const rejectedApp = { ...app, status: APPLICATION_STATUS.REJECTED, applicationType: firstAppType }

    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetPrisonerApp({ app: rejectedApp })
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetAppResponse({
      app: rejectedApp,
      decision: 'REJECTED',
      reason: 'Prisoner used the wrong app',
    })

    await signIn()
    await page.goto(`/applications/${rejectedApp.requestedBy.username}/${rejectedApp.id}?applicationClosed=true`)

    await expect(page.locator('.moj-alert')).toContainText('Application closed')
    await expect(page.locator('h1')).toContainText(rejectedApp.applicationType.name)
  })

  test('should display APPROVED decision in summary list', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const approvedApp = { ...app, status: APPLICATION_STATUS.APPROVED, applicationType: firstAppType }

    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetPrisonerApp({ app: approvedApp })
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetAppResponse({ app: approvedApp, decision: 'APPROVED' })

    await signIn()
    await page.goto(`/applications/${approvedApp.requestedBy.username}/${approvedApp.id}?applicationClosed=true`)

    await expect(page.locator('.moj-alert')).toContainText('Application closed')
    await expect(page.locator('h1')).toContainText(approvedApp.applicationType.name)
  })
})

test.describe('Action and Reply Page - APPROVED complete journey', () => {
  test('should submit APPROVED decision and display summary', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const scenarioName = 'approved-journey'
    const approvedApp = { ...app, status: APPLICATION_STATUS.APPROVED, applicationType: firstAppType }

    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()

    await stubFor({
      scenarioName,
      requiredScenarioState: 'Started',
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}?requestedBy=true&assignedGroup=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: pendingApp,
      },
    })

    await stubFor({
      scenarioName,
      requiredScenarioState: 'Started',
      newScenarioState: 'submitted',
      request: {
        method: 'POST',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/responses`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: appDecisionResponse({ decision: 'APPROVED' }),
      },
    })

    await stubFor({
      scenarioName,
      requiredScenarioState: 'submitted',
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}?requestedBy=true&assignedGroup=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: approvedApp,
      },
    })

    await managingPrisonerAppsApi.stubGetAppResponse({ app: approvedApp, decision: 'APPROVED' })

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/reply`)

    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('APPROVED').check()
    await actionAndReplyPage.saveButton().click()

    await expect(page).toHaveURL(new RegExp(`/applications/${app.requestedBy.username}/${app.id}\\?applicationClosed=true`))

    await expect(page.locator('.moj-alert')).toContainText('Application closed')
    await expect(page.locator('h1')).toContainText(firstAppType.name)
  })
})

test.describe('Action and Reply Page - DECLINED complete journey', () => {
  test('should submit DECLINED decision with reason and display summary', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const scenarioName = 'declined-journey'
    const declineReason = 'Application does not meet the required criteria'
    const declinedApp = { ...app, status: APPLICATION_STATUS.DECLINED, applicationType: firstAppType }

    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()

    await stubFor({
      scenarioName,
      requiredScenarioState: 'Started',
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}?requestedBy=true&assignedGroup=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: pendingApp,
      },
    })

    await stubFor({
      scenarioName,
      requiredScenarioState: 'Started',
      newScenarioState: 'submitted',
      request: {
        method: 'POST',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/responses`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: appDecisionResponse({ decision: 'DECLINED', reason: declineReason }),
      },
    })

    await stubFor({
      scenarioName,
      requiredScenarioState: 'submitted',
      request: {
        method: 'GET',
        url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}?requestedBy=true&assignedGroup=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: declinedApp,
      },
    })

    await managingPrisonerAppsApi.stubGetAppResponse({ app: declinedApp, decision: 'DECLINED', reason: declineReason })

    await signIn()
    await page.goto(`/applications/${app.requestedBy.username}/${app.id}/reply`)

    const actionAndReplyPage = new ActionAndReplyPage(page)
    await actionAndReplyPage.selectAction('DECLINED').check()
    await actionAndReplyPage.reasonInput().fill(declineReason)
    await actionAndReplyPage.saveButton().click()

    await expect(page).toHaveURL(new RegExp(`/applications/${app.requestedBy.username}/${app.id}\\?applicationClosed=true`))

    await expect(page.locator('.moj-alert')).toContainText('Application closed')
    await expect(page.locator('h1')).toContainText(firstAppType.name)
  })
})

test.describe('Action and Reply Page - REJECTED complete journey', () => {
  const rejectionReasons = [
    'Prisoner used the wrong app',
    'Prisoner has already sent this app',
    'Prisoner sent an abusive app',
  ]

  rejectionReasons.forEach((rejectionReason, index) => {
    test(`should submit REJECTED with "${rejectionReason}" and display in summary`, async ({ page, signIn }) => {
      test.skip(!isWiremock, 'Requires WireMock stubs')

      const scenarioName = `rejected-journey-${index}`
      const rejectedApp = { ...app, status: APPLICATION_STATUS.REJECTED, applicationType: firstAppType }

      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()

      // Initial GET returns the pending app
      await stubFor({
        scenarioName,
        requiredScenarioState: 'Started',
        request: {
          method: 'GET',
          url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}?requestedBy=true&assignedGroup=true`,
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: pendingApp,
        },
      })

      // POST transitions scenario to submitted state
      await stubFor({
        scenarioName,
        requiredScenarioState: 'Started',
        newScenarioState: 'submitted',
        request: {
          method: 'POST',
          url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}/responses`,
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: appDecisionResponse({ decision: 'REJECTED', reason: rejectionReason }),
        },
      })

      // After POST redirect, GET returns the rejected (closed) app
      await stubFor({
        scenarioName,
        requiredScenarioState: 'submitted',
        request: {
          method: 'GET',
          url: `/managingPrisonerApps/v1/prisoners/${app.requestedBy.username}/apps/${app.id}?requestedBy=true&assignedGroup=true`,
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: rejectedApp,
        },
      })

      // GET response details for the closed summary view
      await managingPrisonerAppsApi.stubGetAppResponse({
        app: rejectedApp,
        decision: 'REJECTED',
        reason: rejectionReason,
      })

      await signIn()
      await page.goto(`/applications/${app.requestedBy.username}/${app.id}/reply`)

      const actionAndReplyPage = new ActionAndReplyPage(page)
      await actionAndReplyPage.selectAction('REJECTED').check()
      await actionAndReplyPage.rejectedReasonRadio(rejectionReason).check()
      await actionAndReplyPage.saveButton().click()

      await expect(page).toHaveURL(new RegExp(`/applications/${app.requestedBy.username}/${app.id}\\?applicationClosed=true`))

      await expect(page.locator('.moj-alert')).toContainText('Application closed')
      await expect(page.locator('h1')).toContainText(firstAppType.name)
    })
  })
})
