import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ApplicationTypePage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Select application type')
  }

  backLink(): PageElement {
    return this.page.getByRole('link', { name: 'Back' })
  }

  radioButton(): PageElement {
    return this.page.locator('.govuk-radios__item')
  }

  radioButtonByLabel(label: string): PageElement {
    return this.page.locator('.govuk-radios__item', {
      has: this.page.locator('label', { hasText: label }),
    })
  }

  radioButtonOrDivider(): PageElement {
    return this.page.locator('.govuk-radios__divider')
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

  async selectApplicationType(applicationTypeName: string): Promise<void> {
    const radio = this.radioButtonByLabel(applicationTypeName).locator('input.govuk-radios__input')
    await radio.click()
  }

  async continueToNextPage(): Promise<void> {
    await this.continueButton().click()
  }
}
