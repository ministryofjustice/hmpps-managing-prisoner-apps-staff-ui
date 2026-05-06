import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class SubmitApplicationPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Application submitted')
  }

  async checkOnPage(): Promise<void> {
    await expect(this.panelTitle()).toContainText('Application submitted')
  }

  panelTitle(): PageElement {
    return this.page.locator('.govuk-panel__title')
  }

  panelBody(): PageElement {
    return this.page.locator('.govuk-panel__body')
  }

  submissionText(): PageElement {
    return this.page.locator('.govuk-body-l')
  }

  bulletLists(): PageElement {
    return this.page.locator('.govuk-list--bullet')
  }

  logAnotherApplicationForSamePrisonerLink(): PageElement {
    return this.page.locator('a[href="/log/group?isLoggingForSamePrisoner=true"]')
  }

  logNewApplicationLink(): PageElement {
    return this.page.locator('a[href="/log/prisoner-details"]')
  }

  viewApplicationLink(prisonerId: string, appId: string): PageElement {
    return this.page.locator(`a[href="/applications/${prisonerId}/${appId}"]`)
  }

  viewAllApplicationsLink(): PageElement {
    return this.page.locator('a[href="/applications"]')
  }
}
