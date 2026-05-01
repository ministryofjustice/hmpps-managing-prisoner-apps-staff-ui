import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ApplicationDetailsPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Log details')
  }

  async checkOnPage(): Promise<void> {
    await expect(this.page.locator('h1').first()).toContainText('Log details')
  }

  async assertBrowserTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text))
  }

  appTypeTitle(): PageElement {
    return this.page.locator('.govuk-caption-xl')
  }

  textArea(): PageElement {
    return this.page.locator('textarea#details')
  }

  continueButton(): PageElement {
    return this.page.locator('.govuk-button--primary')
  }

  errorSummary(): PageElement {
    return this.page.locator('.govuk-error-summary')
  }

  errorMessage(): PageElement {
    return this.page.locator('.govuk-error-message').first()
  }

  amountInput(): PageElement {
    return this.page.locator('#amount')
  }

  // First night / early days centre
  firstNightOrEarlyDaysCentreLabel(): PageElement {
    return this.page.locator('text=Is this person in the first night or early days centre?')
  }

  firstNightOrEarlyDaysCentre(): PageElement {
    return this.page.locator('input[type="radio"]')
  }

  firstNightOrEarlyDaysCentreYes(): PageElement {
    return this.page.locator('input[type="radio"][value="yes"]')
  }

  firstNightOrEarlyDaysCentreNo(): PageElement {
    return this.page.locator('input[type="radio"][value="no"]')
  }

  firstNightOrEarlyDaysCentreErrorMessage(): PageElement {
    return this.page
      .locator('.govuk-error-message')
      .filter({ hasText: 'Select yes if this person is in the first night or early days centre' })
  }

  async fillEmergencyPhoneCredit(): Promise<void> {
    await this.page.locator('#amount').fill('10')
    await this.page.locator('#reason').fill('Emergency contact required')
  }

  async fillOfficialPinPhoneContact(): Promise<void> {
    await this.page.locator('#firstName').fill('Jane')
    await this.page.locator('#lastName').fill('Smith')
    await this.page.locator('#organisation').fill('Ministry of Justice')
    await this.page.locator('#relationship').selectOption({ label: 'Probation Officer' })
    await this.page.locator('#telephone1').fill('07701234560')
  }

  async fillSocialContactInvalidTelephone(): Promise<void> {
    await this.page.locator('#firstName').fill('John')
    await this.page.locator('#lastName').fill('Doe')
    await this.page.locator('input[value="dateofbirth"]').check({ force: true })
    await this.page.locator('#dob-day').fill('01')
    await this.page.locator('#dob-month').fill('01')
    await this.page.locator('#dob-year').fill('1990')
    await this.page.locator('#relationship').selectOption({ index: 1 })
    await this.page.locator('#telephone1').fill('invalid')
  }

  async fillSocialPinPhoneContact(): Promise<void> {
    await this.page.locator('#firstName').fill('John')
    await this.page.locator('#lastName').fill('Doe')
    await this.page.locator('input[value="dateofbirth"]').check({ force: true })
    await this.page.locator('#dob-day').fill('01')
    await this.page.locator('#dob-month').fill('01')
    await this.page.locator('#dob-year').fill('1990')
    await this.page.locator('#relationship').selectOption({ label: 'Cousin' })
    await this.page.locator('#enter-address-manually-link').click()
    await this.page.locator('#addressline1').fill('123 Main St')
    await this.page.locator('#townorcity').fill('London')
    await this.page.locator('#postcode').fill('SW1A 1AA')
    await this.page.locator('#country').selectOption({ value: 'GB' })
    await this.page.locator('#telephone1').fill('07701234567')
  }

  async fillRemovePinPhoneContact(): Promise<void> {
    await this.page.locator('#firstName').fill('John')
    await this.page.locator('#lastName').fill('Doe')
    await this.page.locator('#telephone1').fill('07701234560')
    await this.page.locator('#relationship').fill('Friend')
  }
}
