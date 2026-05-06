import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ConfirmPhotoPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Confirm image')
  }

  caption(): PageElement {
    return this.page.locator('.govuk-caption-xl')
  }

  editInstructions(): PageElement {
    // On load, JS shows #photo-cropper-container and hides #photo-preview-container
    return this.page.locator('#photo-cropper-container .hmpps-cropper-photo-container__description')
  }

  photoPreview(): PageElement {
    // #photo-preview is inside the hidden #photo-preview-container; use toBeAttached() not toBeVisible()
    return this.page.locator('#photo-preview')
  }

  previewButton(): PageElement {
    // Visible initially since #photo-cropper-container is shown on load
    return this.page.locator('#photo-cropper-container #toggle-crop-button').filter({ hasText: 'Preview' })
  }

  editPhotoButton(): PageElement {
    // Hidden initially; visible after clicking previewButton to switch to preview mode
    return this.page.locator('#photo-preview-container #toggle-crop-button').filter({ hasText: 'Edit the photo' })
  }

  async openCropper(): Promise<void> {
    await this.editPhotoButton().click()
  }

  saveAndContinueButton(): PageElement {
    return this.page.getByRole('button', { name: 'Save and continue' })
  }

  async saveAndContinue(): Promise<void> {
    await this.saveAndContinueButton().click()
  }
}
