import { expect, test } from '../fixtures'
import { app } from '../../../server/testData'
import ViewApplicationPage from '../pages/viewApplicationPage'
import { filteredApplicationTypes, visitApplicationPage } from './view-applicationTestUtils'

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

    test('should allow navigating to the Comments section', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.commentsTab()).toBeVisible()
      await expect(viewPage.commentsTab()).toContainText('Comments')
      await expect(viewPage.commentsTab()).toHaveAttribute(
        'href',
        '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/comments',
      )
    })

    test('should allow navigating to the Action and Reply section', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.actionAndReplyTab()).toBeVisible()
      await expect(viewPage.actionAndReplyTab()).toContainText('Action and reply')
      await expect(viewPage.actionAndReplyTab()).toHaveAttribute(
        'href',
        '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/reply',
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
