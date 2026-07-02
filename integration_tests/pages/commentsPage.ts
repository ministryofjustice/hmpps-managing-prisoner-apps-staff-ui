import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class CommentsPage extends AbstractPage {
  constructor(page: Page) {
    super(page, '')
  }

  pageTitle(): Promise<string> {
    return this.page.title()
  }

  subNavigation(): PageElement {
    return this.page.locator('.moj-sub-navigation')
  }

  activeTab(): PageElement {
    return this.page.locator('.moj-sub-navigation__item a[aria-current="page"]')
  }

  commentBox(): PageElement {
    return this.page.locator('#comment')
  }

  commentLabel(): PageElement {
    return this.page.locator('label[for="comment"]')
  }

  errorSummary(): PageElement {
    return this.page.locator('.govuk-error-summary')
  }

  errorMessage(): PageElement {
    return this.page.locator('.govuk-error-message')
  }

  submitButton(): PageElement {
    return this.page.locator('button.govuk-button--primary')
  }

  comments(): PageElement {
    return this.page.locator('.app-messages, .app-message')
  }

  commentsSectionHeading(): PageElement {
    return this.page.getByRole('heading', { name: 'Messages and replies' })
  }
}
