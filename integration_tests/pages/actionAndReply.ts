import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ActionAndReplyPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Action and reply')
  }

  async checkOnPage(): Promise<void> {
    await expect(this.page.locator('h1.govuk-heading-xl')).toContainText('Action and reply')
  }

  async assertBrowserTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text))
  }

  caption(): PageElement {
    return this.page.locator('.govuk-caption-xl')
  }

  actionRadios(): PageElement {
    return this.page.locator('.govuk-radios')
  }

  selectAction(action: 'APPROVED' | 'DECLINED'): PageElement {
    return this.page.locator(`input[name="decision"][value="${action}"]`)
  }

  reasonInput(): PageElement {
    return this.page.locator('#action-and-reply-reason')
  }

  saveButton(): PageElement {
    return this.page.locator('.govuk-button.govuk-button--primary')
  }

  errorSummary(): PageElement {
    return this.page.locator('.govuk-error-summary')
  }

  summaryList(): PageElement {
    return this.page.locator('.govuk-summary-list').first()
  }

  summaryListKeys(): PageElement {
    return this.summaryList().locator('.govuk-summary-list__key')
  }

  summaryListValues(): PageElement {
    return this.summaryList().locator('.govuk-summary-list__value')
  }

  printButton(): PageElement {
    return this.page.locator('#print-button')
  }
}
