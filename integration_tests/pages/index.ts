import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class IndexPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Applications')
  }

  async checkOnPage(): Promise<void> {
    const dpsHomeHeading = this.page.getByRole('heading', { name: 'Welcome to Digital Prison Services' })
    const onDpsHome = await dpsHomeHeading.isVisible().catch(() => false)

    if (onDpsHome) {
      const applicationsLink = this.page.getByRole('link', { name: 'Applications' }).first()
      const href = await applicationsLink.getAttribute('href')
      if (href) {
        await this.page.goto(href)
      } else {
        await applicationsLink.click()
      }
    }

    await super.checkOnPage()
  }

  headerUserName(): PageElement {
    return this.page.locator('[data-qa="header-user-name"], [data-qa="connect-dps-common-header-user-name"]')
  }

  banner(): PageElement {
    return this.page.locator('.applications-landing-page__banner')
  }

  logNewApplicationCard(): PageElement {
    return this.page.locator('[data-testid="log-new-application"]')
  }

  viewAllApplicationsCard(): PageElement {
    return this.page.locator('[data-testid="view-all-applications"]')
  }

  async assertBrowserTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text))
  }

  async assertHeaderUserNameContains(text: string): Promise<void> {
    await expect(this.headerUserName()).toContainText(text)
  }

  async assertHeaderUserNamePopulated(): Promise<void> {
    await expect(this.headerUserName()).toBeVisible()
    const value = (await this.headerUserName().first().innerText()).trim()
    expect(value.length).toBeGreaterThan(0)
  }

  async assertHeaderUserNamePresent(): Promise<void> {
    await expect(this.headerUserName()).toBeVisible()
  }

  async clickSignOut(): Promise<void> {
    if (await this.signoutLink.isVisible()) {
      await this.signOut()
      return
    }

    const headerUserName = this.headerUserName()
    const headerUserNameVisible = await headerUserName.isVisible()
    const accountMenuTrigger = this.accountMenuTrigger()
    const accountMenuVisible = (await accountMenuTrigger).isVisible().catch(() => false)

    if (headerUserNameVisible && accountMenuVisible) {
      await (await accountMenuTrigger).click()
    } else if (headerUserNameVisible) {
      await headerUserName.click()
    }
    await this.signOut()
  }

  async openManageDetailsInSameTab(): Promise<void> {
    const headerUserName = this.page.locator('[data-qa="connect-dps-common-header-user-name"]').first()
    const cdpsMenuVisible = await headerUserName.isVisible().catch(() => false)
    if (cdpsMenuVisible) {
      await headerUserName.click()
    }

    const manageDetails = this.manageUserDetails.first()
    const href = await manageDetails.getAttribute('href')
    if (href?.startsWith('http')) {
      await this.page.goto(href)
    } else {
      const target = await manageDetails.getAttribute('target')
      if (target) {
        await manageDetails.evaluate(el => el.removeAttribute('target'))
      }
      await manageDetails.click()
    }
  }

  async assertBannerContent(): Promise<void> {
    const banner = this.banner()
    await expect(banner).toBeVisible()
    await expect(banner.locator('h1')).toContainText('Applications')
    await expect(banner.locator('p').nth(0)).toContainText('Log, action and reply to prisoner applications.')
    await expect(banner.locator('p').nth(1)).toContainText('Give us your')
    await expect(banner.locator('p').nth(1).locator('a')).toBeVisible()
  }

  async assertLogNewApplicationCard(): Promise<void> {
    const card = this.logNewApplicationCard()
    await expect(card).toBeVisible()
    await expect(card.locator('h2')).toContainText('Log a new application')
    await expect(card.locator('a')).toHaveAttribute('href', '/log/prisoner-details')
    await expect(card.locator('p')).toContainText('Log a new application to process.')
  }

  async assertViewAllApplicationsCard(): Promise<void> {
    const card = this.viewAllApplicationsCard()
    await expect(card).toBeVisible()
    await expect(card.locator('h2')).toContainText('View all applications')
    await expect(card.locator('a')).toHaveAttribute('href', '/applications')
    await expect(card.locator('p')).toContainText('View all applications logged in your prison.')
  }
}
