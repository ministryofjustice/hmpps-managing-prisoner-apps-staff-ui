import { type Page as PlaywrightPage, expect } from '@playwright/test'

export type PageElement = ReturnType<PlaywrightPage['locator']>

const accountMenuTriggerSelector = '.cdps-header__link-wrapper:has([data-qa="connect-dps-common-header-user-name"])'

export default abstract class Page {
  protected constructor(
    protected readonly page: PlaywrightPage,
    private readonly title: string,
  ) {}

  static async verifyOnPage<T extends Page>(PageClass: new (page: PlaywrightPage) => T, page: PlaywrightPage): Promise<T> {
    const instance = new PageClass(page)
    await instance.checkOnPage()
    return instance
  }

  async checkOnPage(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText(this.title)
  }

  accountMenuTrigger(): PageElement {
    return this.page.locator(accountMenuTriggerSelector)
  }

  signOut(): PageElement {
    return this.page.locator('[data-qa="signOut"], a[href="/sign-out"]')
  }

  manageDetails(): PageElement {
    return this.page.locator('[data-qa="manageDetails"], a[href*="/auth/account-details"], a:has-text("Your account")')
  }
}
