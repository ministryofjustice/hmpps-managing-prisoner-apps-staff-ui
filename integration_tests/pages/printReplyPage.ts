import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class PrintReplyPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Print reply')
  }

  statusMessage(): PageElement {
    return this.page.getByRole('heading', { level: 2 })
  }

  printButton(): PageElement {
    return this.page.locator('#print-button')
  }

  summaryList(): PageElement {
    return this.page.locator('.govuk-summary-list').first()
  }

  printableTemplate(): PageElement {
    return this.page.locator('div[class*="govuk-!-display-block-print"]')
  }

  async checkOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/print-reply$/)
  }

  async assertOpenApplicationStatus(statusText: string): Promise<void> {
    await this.checkOnPage()
    await expect(this.statusMessage()).toContainText(statusText)
    await expect(this.printButton()).not.toBeVisible()
  }

  async assertClosedApplicationSummary(): Promise<void> {
    await this.checkOnPage()
    await expect(this.summaryList()).toContainText('Status')
    await expect(this.summaryList()).toContainText('Reason')
    await expect(this.summaryList()).toContainText('Date')
    await expect(this.summaryList()).toContainText('Location')
    await expect(this.printButton()).toBeVisible()
  }

  async installPrintSpy(): Promise<void> {
    await this.page.addInitScript(() => {
      ;(window as Window & { printInvokedForTest?: boolean }).printInvokedForTest = false
      window.print = () => {
        ;(window as Window & { printInvokedForTest?: boolean }).printInvokedForTest = true
      }
    })
  }

  async assertPrintHasNotBeenTriggered(): Promise<void> {
    await expect
      .poll(async () =>
        this.page.evaluate(() => (window as Window & { printInvokedForTest?: boolean }).printInvokedForTest),
      )
      .toBe(false)
  }

  async assertPrintHasBeenTriggered(): Promise<void> {
    await expect
      .poll(async () =>
        this.page.evaluate(() => (window as Window & { printInvokedForTest?: boolean }).printInvokedForTest === true),
      )
      .toBe(true)
  }

  async assertPrintableReplyTemplate(): Promise<string> {
    await this.checkOnPage()
    await expect(this.printableTemplate()).toHaveCount(1)

    const printableTemplateText = await this.printableTemplate().innerText()
    await expect(this.printableTemplate()).toContainText('Your application has been approved.')
    expect(printableTemplateText).toContain('Application type')
    expect(printableTemplateText).toContain('Status')
    expect(printableTemplateText).toContain('Reason')
    expect(printableTemplateText).toContain('Business Hub')

    return printableTemplateText
  }
}
