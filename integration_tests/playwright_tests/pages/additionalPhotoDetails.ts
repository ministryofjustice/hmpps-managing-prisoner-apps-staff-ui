import { type Page as PlaywrightPage, expect } from '@playwright/test'
import Page, { type PageElement } from './page'

export default class AdditionalPhotoDetailsPage extends Page {
  constructor(page: PlaywrightPage) {
    super(page, 'Enter additional details')
  }

  async assertBrowserTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text))
  }

  heading(): PageElement {
    return this.page.locator('h1.govuk-heading-xl')
  }

  caption(): PageElement {
    return this.page.locator('.govuk-caption-xl')
  }

  detailsLabel(): PageElement {
    return this.page.locator('label').filter({ hasText: 'Add additional details about this application (optional)' })
  }

  textArea(): PageElement {
    return this.page.locator('#additionalDetails')
  }

  continueButton(): PageElement {
    return this.page.getByRole('button', { name: 'Continue' })
  }

  errorSummary(): PageElement {
    return this.page.locator('.govuk-error-summary')
  }
}
