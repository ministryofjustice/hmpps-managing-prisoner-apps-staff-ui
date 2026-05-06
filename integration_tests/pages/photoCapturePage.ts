import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class PhotoCapturePage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Take a photo of the application')
  }

  backLink(): PageElement {
    return this.page.getByRole('link', { name: 'Back' })
  }

  instructions(): PageElement {
    return this.page.locator('#hmpps-webcam__photo-preview-container .govuk-list.govuk-list--bullet').first()
  }

  csrfToken(): PageElement {
    return this.page.locator('input[name="_csrf"]')
  }

  fileInput(): PageElement {
    return this.page.locator('input[type="file"]')
  }

  webcamErrorPanel(): PageElement {
    return this.page.locator('#hmpps-webcam__photo-capture-container__error')
  }

  async uploadPhotoAndSubmit(filePath: string): Promise<void> {
    await this.fileInput().setInputFiles(filePath)
    await this.page.locator('form').evaluate(f => (f as HTMLFormElement).submit())
  }
}
