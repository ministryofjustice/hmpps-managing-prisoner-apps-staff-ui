import { Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AuthManageDetailsPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Your account details')
  }
}
