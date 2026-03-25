import { type Page as PlaywrightPage } from '@playwright/test'
import Page, { type PageElement } from './page'

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
    await this.usernameField().fill(username)
    await this.passwordField().fill(password)
    await this.signInButton().click()
  }
}
