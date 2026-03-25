import { type Page as PlaywrightPage } from '@playwright/test'
import Page, { type PageElement } from './page'

const MANAGE_APPS_USERNAME = process.env.MANAGE_APPS_USERNAME || ''
const MANAGE_APPS_PASSWORD = process.env.MANAGE_APPS_PASSWORD || ''

export default class AuthSignInPage extends Page {
  constructor(page: PlaywrightPage) {
    super(page, 'Sign in')
  }

  usernameField(): PageElement {
    return this.page.locator('#username')
  }

  passwordField(): PageElement {
    return this.page.locator('#password')
  }

  signInButton(): PageElement {
    return this.page.getByRole('button', { name: 'Sign in' })
  }

  async signInWith(username: string, password: string): Promise<void> {
    await this.usernameField().fill(MANAGE_APPS_USERNAME)
    await this.passwordField().fill(MANAGE_APPS_PASSWORD)
    await this.signInButton().click()
  }
}
