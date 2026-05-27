import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class DepartmentPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Select department')
  }

  backLink(): PageElement {
    return this.page.getByRole('link', { name: 'Back' })
  }

  radioButtons(): PageElement {
    return this.page.locator('.govuk-radios__item')
  }

  continueButton(): PageElement {
    return this.page.getByRole('button', { name: 'Continue' })
  }

  errorSummary(): PageElement {
    return this.page.locator('.govuk-error-summary')
  }

  errorMessage(): PageElement {
    return this.page.locator('.govuk-form-group--error .govuk-error-message')
  }
}
