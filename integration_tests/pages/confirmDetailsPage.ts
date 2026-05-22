import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ConfirmDetailsPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Check details')
  }

  backLink(): PageElement {
    return this.page.getByRole('link', { name: 'Back' })
  }

  summaryRowByLabel(label: string): PageElement {
    return this.page.locator('.govuk-summary-list__row', { has: this.page.getByText(label) })
  }

  applicationTypeSummary(): PageElement {
    return this.summaryRowByLabel('Application type')
  }

  prisonerSummary(): PageElement {
    return this.summaryRowByLabel('Prisoner')
  }

  changeApplicationTypeLink(): PageElement {
    return this.applicationTypeSummary().getByRole('link', { name: 'Change application type' })
  }

  submitApplicationButton(): PageElement {
    return this.page.getByRole('button', { name: 'Submit application' })
  }

  saveButton(): PageElement {
    return this.page.getByRole('button', { name: 'Save' })
  }

  cancelLink(): PageElement {
    return this.page.getByRole('link', { name: 'Cancel' })
  }
}
