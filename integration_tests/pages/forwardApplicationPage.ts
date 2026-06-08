import { Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ForwardApplicationPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Forward this application')
  }

  pageTitle = () => this.page.locator('h1').first()

  departmentRadios = () => this.page.locator('input[name="forwardTo"]')

  forwardingReasonField = () => this.page.locator('#forwarding-reason')

  submitButton = () => this.page.locator('button[type="submit"]')

  selectDepartment = async (departmentId: string) => {
    await this.page.locator(`input[name="forwardTo"][value="${departmentId}"]`).check()
  }

  enterForwardingReason = async (reason: string) => {
    await this.forwardingReasonField().fill(reason)
  }

  submit = async () => {
    await this.submitButton().click()
  }

  getErrorSummary = () => this.page.locator('.govuk-error-summary')

  getErrorMessage = (fieldName: string) => this.page.locator(`#${fieldName}-error`)
}
