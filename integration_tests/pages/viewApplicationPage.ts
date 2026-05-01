import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ViewApplicationPage extends AbstractPage {
  constructor(page: Page) {
    // Extract the application type name from the h1
    super(page, '')
  }

  async checkOnPage(): Promise<void> {
    // Verify we're on a view application page by checking for the expected sections
    await this.page.locator('.moj-sub-navigation').waitFor()
  }

  pageTitle(): Promise<string> {
    return this.page.title()
  }

  applicationType(): PageElement {
    return this.page.locator('.govuk-summary-list__row:has-text("Application type") .govuk-summary-list__value')
  }

  applicationStatus(): PageElement {
    return this.page.locator('.govuk-summary-list__row:has-text("Status") .govuk-summary-list__value')
  }

  department(): PageElement {
    return this.page.locator('.govuk-summary-list__row:has-text("Department") .govuk-summary-list__value')
  }

  prisonerName(): PageElement {
    return this.page.locator('.govuk-summary-list__row:has-text("Prisoner") .govuk-summary-list__value')
  }

  prisonerCellLocation(): PageElement {
    return this.page.locator('.govuk-summary-list__row:has-text("Location") .govuk-summary-list__value')
  }

  submittedOn(): PageElement {
    return this.page.locator('.govuk-summary-list__row:has(dt:text-is("Date")) .govuk-summary-list__value')
  }

  forwardApplication(): PageElement {
    return this.page.locator('.govuk-summary-list__row:has-text("Department") a')
  }

  commentsTab(): PageElement {
    return this.page.locator('.moj-sub-navigation__link:has-text("Comments")')
  }

  actionAndReplyTab(): PageElement {
    return this.page.locator('.moj-sub-navigation__link:has-text("Action and reply")')
  }

  historyTab(): PageElement {
    return this.page.locator('.moj-sub-navigation__link:has-text("History")')
  }

  viewProfileLink(): PageElement {
    return this.page.locator('a:has-text("View profile")')
  }

  viewAlertsLink(): PageElement {
    return this.page.locator('a:has-text("View alerts")')
  }

  summaryListRowKey(keyText: string): PageElement {
    return this.page.locator('.govuk-summary-list__key', { hasText: keyText })
  }

  image1Label(): PageElement {
    return this.page.locator('dt:has-text("Image 1")')
  }

  image2Label(): PageElement {
    return this.page.locator('dt:has-text("Image 2 (optional)")')
  }

  thumbnailImages(): PageElement {
    return this.page.locator('img.thumbnail-img')
  }

  additionalDetailsLabel(): PageElement {
    return this.page.locator('dt:has-text("Additional details")')
  }

  changeButton(): PageElement {
    return this.page.locator('.govuk-summary-list--header:has-text("Change")')
  }
}
