import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class PrintReplyPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Print reply')
  }

  activeTab(): PageElement {
    return this.page.locator('.moj-sub-navigation__item a[aria-current="page"]')
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
    await expect(this.activeTab()).toContainText('Print reply')
  }
}
