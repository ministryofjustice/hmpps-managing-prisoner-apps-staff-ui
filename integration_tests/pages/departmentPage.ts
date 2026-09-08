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

  radioButtonByLabel(label: string): PageElement {
    return this.page.getByRole('radio', { name: label })
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

  async selectDepartment(departmentName: string): Promise<void> {
    await this.radioButtonByLabel(departmentName).check({ force: true })
  }

  async continueToNextPage(): Promise<void> {
    await this.continueButton().click()
  }
}
