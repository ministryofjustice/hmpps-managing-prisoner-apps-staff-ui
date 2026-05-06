import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class AddAnotherPhotoPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Do you want to add another photo of the application?')
  }

  yesOption(): PageElement {
    return this.page.locator('input[value="yes"]')
  }

  noOption(): PageElement {
    return this.page.locator('input[value="no"]')
  }

  continueButton(): PageElement {
    return this.page.getByRole('button', { name: 'Continue' })
  }

  errorSummary(): PageElement {
    return this.page.locator('.govuk-error-summary')
  }

  selectYes(): Promise<void> {
    return this.yesOption().check({ force: true })
  }

  selectNo(): Promise<void> {
    return this.noOption().check({ force: true })
  }
}
