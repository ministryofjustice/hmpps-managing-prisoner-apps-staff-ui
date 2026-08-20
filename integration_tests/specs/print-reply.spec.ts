import { test, expect } from '../fixtures'
import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import { app } from '../../server/testData'
import PrintReplyPage from '../pages/printReplyPage'
import ViewApplicationPage from '../pages/viewApplicationPage'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import { isWiremock, visitApplicationPage } from './view-applicationTestUtils'

test.describe('Print reply tab', () => {
  test('should display the current status for an open application', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const openApplication = { ...app, status: APPLICATION_STATUS.NEW }
    await visitApplicationPage({ page, signIn, application: openApplication })

    const viewApplicationPage = new ViewApplicationPage(page)
    await expect(viewApplicationPage.printReplyTab()).toBeVisible()
    await viewApplicationPage.printReplyTab().click()

    const printReplyPage = new PrintReplyPage(page)
    await printReplyPage.checkOnPage()
    await expect(page).toHaveURL(/\/print-reply$/)
    await expect(printReplyPage.statusMessage()).toContainText('This application is now New')
    await expect(printReplyPage.printButton()).not.toBeVisible()
  })

  test('should display the closed application response and print button', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const closedApplication = { ...app, status: APPLICATION_STATUS.APPROVED }
    await visitApplicationPage({ page, signIn, application: closedApplication })
    await managingPrisonerAppsApi.stubGetAppResponse({ app: closedApplication, decision: 'APPROVED' })

    const viewApplicationPage = new ViewApplicationPage(page)
    await viewApplicationPage.printReplyTab().click()

    const printReplyPage = new PrintReplyPage(page)
    await printReplyPage.checkOnPage()
    await expect(page).toHaveURL(/\/print-reply$/)
    await expect(printReplyPage.summaryList()).toContainText('Status')
    await expect(printReplyPage.summaryList()).toContainText('Reason')
    await expect(printReplyPage.summaryList()).toContainText('Date')
    await expect(printReplyPage.summaryList()).toContainText('Location')
    await expect(printReplyPage.printButton()).toBeVisible()
  })
})
