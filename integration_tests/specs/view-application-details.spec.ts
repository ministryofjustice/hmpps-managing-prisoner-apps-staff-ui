import { expect, test } from '../fixtures'
import { app } from '../../server/testData'
import ForwardApplicationPage from '../pages/forwardApplicationPage'
import ViewApplicationPage from '../pages/viewApplicationPage'
import { filteredApplicationTypes, visitApplicationPage } from './view-applicationTestUtils'
import {
  assertAndCaptureHistoryEvents,
  getForwardTargetDepartment,
  stubForwardFlowStateTransition,
  stubForwardHistoryEvents,
} from './view-application-forward-history-helper'

filteredApplicationTypes.forEach(({ name, id }) => {
  test.describe(`View Application Page - ${name}`, () => {
    const application = { ...app, applicationType: { id, name } }

    test.beforeEach(async ({ page, signIn }) => {
      await visitApplicationPage({ page, signIn, application })
    })

    test('should display the correct page title', async ({ page }) => {
      const title = await page.locator('h1').innerText()
      expect(title).toContain(name)
    })

    test('should display the application type correctly', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.applicationType()).toContainText(name)
    })

    test('should display the application status', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.applicationStatus()).toBeVisible()
    })

    test('should display the department handling the application', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.department()).toBeVisible()
    })

    test('should display the prisoner name', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.prisonerName()).toBeVisible()
    })

    test('should display the prisoner cell location', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.prisonerCellLocation()).toBeVisible()
    })

    test('should display the date the application was submitted', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.submittedOn()).toBeVisible()
    })

    test('should display View profile and View alerts links opening in a new tab', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.viewProfileLink()).toBeVisible()
      await expect(viewPage.viewProfileLink()).toHaveAttribute('target', '_blank')
      await expect(viewPage.viewProfileLink()).toHaveAttribute('rel', 'noopener noreferrer')

      await expect(viewPage.viewAlertsLink()).toBeVisible()
      await expect(viewPage.viewAlertsLink()).toHaveAttribute('target', '_blank')
      await expect(viewPage.viewAlertsLink()).toHaveAttribute('rel', 'noopener noreferrer')
    })

    test('should display the incentive level', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.summaryListRowKey('Incentive level')).toBeVisible()
    })

    test('should allow navigating to the Comments or Messages section', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.commentsTab()).toBeVisible()
      await expect(viewPage.commentsTab()).toContainText(/Comments|Messages/)
      await expect(viewPage.commentsTab()).toHaveAttribute(
        'href',
        '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/comments',
      )
    })

    test('should allow navigating to the History section', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.historyTab()).toBeVisible()
      await expect(viewPage.historyTab()).toContainText('History')
      await expect(viewPage.historyTab()).toHaveAttribute(
        'href',
        '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/history',
      )
    })
  })
})

test.describe('View Application Page - Forward button visibility', () => {
  const application = { ...app, applicationType: { id: 3, name: 'Add a social PIN phone contact' } }

  test('should display the action panel actions and open the Mark as closed form from the application page', async ({
    page,
    signIn,
  }) => {
    await visitApplicationPage({ page, signIn, application, departmentCount: 2 })

    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.markAsInProgress()).toBeVisible()
    await expect(viewPage.markAsInProgress()).toContainText('Mark as in progress')
    await expect(viewPage.forwardApplication()).toBeVisible()
    await expect(viewPage.forwardApplication()).toContainText('Forward to another department')
    await expect(viewPage.markAsClosed()).toBeVisible()
    await expect(viewPage.markAsClosed()).toContainText('Mark as closed')

    await viewPage.markAsClosed().click()

    await expect(page).toHaveURL(
      new RegExp(`/applications/${application.requestedBy.username}/${application.id}/reply`),
    )
    await expect(page.locator('h1.govuk-heading-xl')).toContainText('Mark as closed')
  })

  test('should display the Forward to another department button when more than one department is available', async ({
    page,
    signIn,
  }) => {
    await visitApplicationPage({ page, signIn, application, departmentCount: 2 })

    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.forwardApplication()).toBeVisible()
    await expect(viewPage.forwardApplication()).toContainText('Forward to another department')
    await expect(viewPage.forwardApplication()).toHaveAttribute(
      'href',
      `/applications/${application.requestedBy.username}/${application.id}/forward`,
    )
  })

  test('should not display the Forward to another department button when only one department is available', async ({
    page,
    signIn,
  }) => {
    await visitApplicationPage({ page, signIn, application, departmentCount: 1 })

    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.forwardApplication()).not.toBeVisible()
  })

  test('should forward from application page and update the department details section', async (
    { page, signIn },
    testInfo,
  ) => {
    await visitApplicationPage({ page, signIn, application, departmentCount: 2 })

    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.department()).toContainText('Business Hub')
    await expect(viewPage.forwardApplication()).toBeVisible()

    await viewPage.forwardApplication().click()

    const forwardPage = new ForwardApplicationPage(page)
    await expect(forwardPage.pageTitle()).toContainText('Forward this application')

    const targetDepartment = await getForwardTargetDepartment(page, forwardPage)
    const forwardedApplication = await stubForwardFlowStateTransition({
      application,
      targetDepartment,
    })

    await forwardPage.selectDepartment(targetDepartment.value)
    await forwardPage.enterForwardingReason('Forwarding to a new department')
    await forwardPage.submit()

    await expect(page).toHaveURL(new RegExp(`/applications/${application.requestedBy.username}/${application.id}`))
    await expect(page.getByText(`Application forwarded to ${targetDepartment.name}`)).toBeVisible()
    await expect(viewPage.department()).toContainText(targetDepartment.name)

    await stubForwardHistoryEvents({
      application,
      forwardedApplication,
      targetDepartment,
    })

    await assertAndCaptureHistoryEvents({
      page,
      viewPage,
      application,
      targetDepartment,
      testInfo,
    })
  })
})
