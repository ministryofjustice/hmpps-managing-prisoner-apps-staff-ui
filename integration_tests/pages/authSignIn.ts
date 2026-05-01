import { Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class AuthSignInPage extends AbstractPage {
  constructor(page: Page) {
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
