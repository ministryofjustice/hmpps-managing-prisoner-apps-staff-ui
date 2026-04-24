import { type Page as PlaywrightPage, expect } from '@playwright/test'
import Page, { type PageElement } from './page'

export default class ApplicationHistoryPage extends Page {
  constructor(page: PlaywrightPage) {
    super(page, 'History')
  }

  async assertBrowserTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text))
  }

  pageTitle(): PageElement {
    return this.page.locator('h1')
  }

  historyTab(): PageElement {
    return this.page.locator('.moj-sub-navigation__link:has-text("History")')
  }

  pageCaption(): PageElement {
    return this.page.locator('.govuk-caption-xl')
  }

  historyContent(): PageElement {
    return this.page.getByText('History of this application')
  }
}
