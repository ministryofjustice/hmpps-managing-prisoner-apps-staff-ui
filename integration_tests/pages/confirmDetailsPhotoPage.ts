import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ConfirmDetailsPhotoPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Check details')
  }

  rowByLabel(label: string): PageElement {
    return this.page.locator('dt', { hasText: label }).locator('..')
  }

  submitApplicationButton(): PageElement {
    return this.page.getByRole('button', { name: 'Submit application' })
  }

  warningText(): PageElement {
    return this.page.getByText('You cannot save this application')
  }
}
