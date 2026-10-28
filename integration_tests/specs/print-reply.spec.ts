import { test, expect } from '../fixtures'
import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import { app } from '../../server/testData'
import PrintReplyPage from '../pages/printReplyPage'
import ViewApplicationPage from '../pages/viewApplicationPage'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import { isWiremock, visitApplicationPage } from '../helpers/view-applicationTestUtils'

test.describe('Print reply', () => {
  test('should display the current status for an open application', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const openApplication = { ...app, status: APPLICATION_STATUS.NEW }
    await visitApplicationPage({ page, signIn, application: openApplication })

    const viewApplicationPage = new ViewApplicationPage(page)
    await expect(viewApplicationPage.printReplyButton()).not.toBeVisible()
    await page.goto(`${page.url()}/print-reply`)

    const printReplyPage = new PrintReplyPage(page)
    await printReplyPage.assertOpenApplicationStatus('This application is now New')
  })

  test('should display the closed application response and print button', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const closedApplication = { ...app, status: APPLICATION_STATUS.APPROVED }
    await visitApplicationPage({ page, signIn, application: closedApplication })
    await managingPrisonerAppsApi.stubGetAppResponse({ app: closedApplication, decision: 'APPROVED' })

    const viewApplicationPage = new ViewApplicationPage(page)
    await viewApplicationPage.printReplyButton().click()

    const printReplyPage = new PrintReplyPage(page)
    await printReplyPage.assertClosedApplicationSummary()
  })

  test('should trigger browser print when selecting Print reply for a closed application', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const closedApplication = { ...app, status: APPLICATION_STATUS.APPROVED }
    await visitApplicationPage({ page, signIn, application: closedApplication })
    await managingPrisonerAppsApi.stubGetAppResponse({ app: closedApplication, decision: 'APPROVED' })

    const viewApplicationPage = new ViewApplicationPage(page)
    const printReplyPage = new PrintReplyPage(page)

    await printReplyPage.installPrintSpy()
    await viewApplicationPage.printReplyButton().click()

    await printReplyPage.assertPrintHasNotBeenTriggered()
    await printReplyPage.printButton().click()
    await printReplyPage.assertPrintHasBeenTriggered()
  })

  test('should capture the printable reply template content', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Requires WireMock stubs')

    const closedApplication = { ...app, status: APPLICATION_STATUS.APPROVED }
    await visitApplicationPage({ page, signIn, application: closedApplication })
    await managingPrisonerAppsApi.stubGetAppResponse({ app: closedApplication, decision: 'APPROVED' })

    const viewApplicationPage = new ViewApplicationPage(page)
    await viewApplicationPage.printReplyButton().click()

    const printReplyPage = new PrintReplyPage(page)
    const printableTemplateHtml = await printReplyPage.printableTemplate().evaluate(node => node.outerHTML)
    await test.info().attach('print-reply-template.html', {
      body: Buffer.from(printableTemplateHtml, 'utf-8'),
      contentType: 'text/html',
    })

    const printableTemplateText = await printReplyPage.assertPrintableReplyTemplate()
    expect(printableTemplateText).toContain('Application type')
    expect(printableTemplateText).toContain('Status')
    expect(printableTemplateText).toContain('Reason')
    expect(printableTemplateText).toContain('Business Hub')
  })
})
