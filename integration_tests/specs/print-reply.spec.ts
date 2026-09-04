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

  test('should trigger browser print when selecting Print reply for a closed application', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const closedApplication = { ...app, status: APPLICATION_STATUS.APPROVED }
    await visitApplicationPage({ page, signIn, application: closedApplication })
    await managingPrisonerAppsApi.stubGetAppResponse({ app: closedApplication, decision: 'APPROVED' })

    const viewApplicationPage = new ViewApplicationPage(page)
    await viewApplicationPage.printReplyTab().click()

    const printReplyPage = new PrintReplyPage(page)
    await printReplyPage.checkOnPage()
    await expect(printReplyPage.printButton()).toBeVisible()

    await page.evaluate(() => {
      // Track print invocation from the page script click handler.
      ;(window as Window & { printInvokedForTest?: boolean }).printInvokedForTest = false
      window.print = () => {
        ;(window as Window & { printInvokedForTest?: boolean }).printInvokedForTest = true
      }
    })

    await printReplyPage.printButton().click()

    await expect
      .poll(async () =>
        page.evaluate(() => (window as Window & { printInvokedForTest?: boolean }).printInvokedForTest === true),
      )
      .toBe(true)
  })

  test('should capture the printable reply template content', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const closedApplication = { ...app, status: APPLICATION_STATUS.APPROVED }
    await visitApplicationPage({ page, signIn, application: closedApplication })
    await managingPrisonerAppsApi.stubGetAppResponse({ app: closedApplication, decision: 'APPROVED' })

    const viewApplicationPage = new ViewApplicationPage(page)
    await viewApplicationPage.printReplyTab().click()

    const printReplyPage = new PrintReplyPage(page)
    await printReplyPage.checkOnPage()

    await expect(printReplyPage.printableTemplate()).toHaveCount(1)

    const printableTemplateHtml = await printReplyPage.printableTemplate().evaluate(node => node.outerHTML)
    await test.info().attach('print-reply-template.html', {
      body: Buffer.from(printableTemplateHtml, 'utf-8'),
      contentType: 'text/html',
    })

    const printableTemplateText = await printReplyPage.printableTemplate().innerText()
    await expect(printReplyPage.printableTemplate()).toContainText('Your application has been approved.')
    expect(printableTemplateText).toContain('Application type')
    expect(printableTemplateText).toContain('Status')
    expect(printableTemplateText).toContain('Reason')
    expect(printableTemplateText).toContain('Business Hub')
  })
})
