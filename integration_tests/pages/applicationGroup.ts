import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ApplicationGroupPage extends AbstractPage {
  constructor(page: Page) {
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
