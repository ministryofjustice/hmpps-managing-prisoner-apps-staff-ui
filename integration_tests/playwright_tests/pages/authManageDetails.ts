import { type Page as PlaywrightPage } from '@playwright/test'
import Page from './page'

export default class AuthManageDetailsPage extends Page {
  constructor(page: PlaywrightPage) {
    super(page, 'Your account details')
  }
}
