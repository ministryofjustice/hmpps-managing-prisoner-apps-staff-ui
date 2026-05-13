import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class PrisonerDetailsPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Log prisoner details')
  }

  form(): PageElement {
    return this.page.locator('form#log-prisoner-details')
  }

  csrfToken(): PageElement {
    return this.page.locator('input[name="_csrf"]')
  }

  prisonNumberInput(): PageElement {
    return this.page.locator('input#prison-number')
  }

  findPrisonerButton(): PageElement {
    return this.page.locator('[data-test="find-prisoner-button"]')
  }

  findPrisonerButtonErrorMessage(): PageElement {
    return this.page.locator('.govuk-error-message').filter({ hasText: 'Find prisoner to continue' })
  }

  prisonerNameInsetText(): PageElement {
    return this.page.locator('.govuk-inset-text')
  }

  continueButton(): PageElement {
    return this.page.locator('[data-test="continue-button"]')
  }

  backLink(): PageElement {
    return this.page.locator('.govuk-back-link')
  }

  async enterPrisonNumber(prisonNumber: string): Promise<void> {
    await this.prisonNumberInput().fill(prisonNumber)
  }

  async clickFindPrisoner(): Promise<void> {
    await this.findPrisonerButton().click()
  }

  async clickContinue(): Promise<void> {
    await this.continueButton().click()
  }
}
