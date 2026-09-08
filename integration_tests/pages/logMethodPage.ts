import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class LogMethodPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Select method to log this application')
  }

  loggingMethodRadio(value: 'manual' | 'webcam'): PageElement {
    return this.page.locator(`input[name="loggingMethod"][value="${value}"]`)
  }

  continueButton(): PageElement {
    return this.page.getByRole('button', { name: 'Continue' })
  }

  async selectLoggingMethod(value: 'manual' | 'webcam'): Promise<void> {
    await this.loggingMethodRadio(value).check({ force: true })
  }

  async continueToNextPage(): Promise<void> {
    await this.continueButton().click()
  }
}
