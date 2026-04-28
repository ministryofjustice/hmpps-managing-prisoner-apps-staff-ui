import { type Page as PlaywrightPage, expect } from '@playwright/test'
import Page, { type PageElement } from './page'

export default class ApplicationGroupPage extends Page {
  constructor(page: PlaywrightPage) {
    super(page, 'Select application group')
  }

  backLink(): PageElement {
    return this.page.locator('.govuk-back-link')
  }

  radioButtons(): PageElement {
    return this.page.locator('input[type="radio"][name="group"]')
  }

  pinPhoneContactAppsLabel(): PageElement {
    return this.page.getByText('Pin Phone Contact Apps')
  }

  submitButton(): PageElement {
    return this.page.getByRole('button', { name: 'Continue' })
  }

  errorSummary(): PageElement {
    return this.page.locator('.govuk-error-summary')
  }

  errorMessage(): PageElement {
    return this.page.locator('.govuk-error-message')
  }

  async assertBrowserTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text))
  }
}
