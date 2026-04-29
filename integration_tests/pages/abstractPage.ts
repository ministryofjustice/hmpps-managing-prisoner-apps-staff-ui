import { expect, type Locator, type Page } from '@playwright/test'

export type PageElement = ReturnType<Page['locator']>

const accountMenuTriggerSelector = '.cdps-header__link-wrapper:has([data-qa="connect-dps-common-header-user-name"])'

export default class AbstractPage {
  readonly page: Page

  /** user name that appear in header */
  readonly usersName: Locator

  /** phase banner that appear in header */
  readonly phaseBanner: Locator

  /** link to sign out */
  readonly signoutLink: Locator

  /** link to manage user details */
  readonly manageUserDetails: Locator

  readonly title: string

  protected constructor(page: Page, title: string) {
    this.page = page
    this.title = title
    this.phaseBanner = page.getByTestId('header-phase-banner')
    this.usersName = page.getByTestId('header-user-name')
    this.signoutLink = page.locator('[data-qa="signOut"], a[href="/sign-out"]')
    this.manageUserDetails = page.getByTestId('manageDetails')
  }

  async checkOnPage(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText(this.title)
  }

  async accountMenuTrigger() {
    return this.page.locator(accountMenuTriggerSelector)
  }

  async signOut() {
    await this.signoutLink.first().click()
  }

  async clickManageUserDetails() {
    await this.manageUserDetails.first().click()
  }
}
