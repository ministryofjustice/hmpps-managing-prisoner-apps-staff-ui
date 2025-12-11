import Page from './page'

export default class ApplicationDetailsPage extends Page {
  constructor() {
    super('Log details')
  }

  backLink = () => cy.get('.govuk-back-link')

  appTypeTitle = () => cy.get('.govuk-caption-xl')

  pageTitle = () => cy.title()

  hintText = () => cy.get('#details-hint')

  formLabel = () => cy.get('label[for="details"]')

  textArea = () => cy.get('textarea#details')

  csrfToken = () => cy.get('input[name="_csrf"]')

  continueButton = () => cy.get('.govuk-button--primary')

  reasonHintText = () => cy.get('#reason-hint')

  amountInput = () => cy.get('#amount')

  firstNightOrEarlyDaysCentre = () => cy.get('input[type="radio"]')

  firstNightOrEarlyDaysCentreLabel = () => cy.contains('Is this person in the first night or early days centre?')

  firstNightOrEarlyDaysCentreYes = () => cy.get('input[type="radio"][value="yes"]')

  firstNightOrEarlyDaysCentreNo = () => cy.get('input[type="radio"][value="no"]')

  firstNightOrEarlyDaysCentreErrorMessage = () =>
    cy.get('.govuk-error-message').contains('Select yes if this person is in the first night or early days centre')

  errorSummary = () => cy.get('.govuk-error-summary')

  errorMessage = () => cy.get('.govuk-error-message')

  selectFirstNightOption = (value: 'yes' | 'no') => {
    cy.get(`input[type="radio"][value="${value}"]`).check({ force: true })
  }

  emergencyPhoneCreditLogDetails = () => {
    cy.get('#amount').type('10')
    cy.get('#reason').type('Emergency contact required')
  }

  officialPinPhoneContactLogDetails = () => {
    cy.get('#firstName').type('Jane')
    cy.get('#lastName').type('Smith')
    cy.get('#organisation').type('Ministry of Justice')
    cy.get('#relationship').select('Solicitor')
    cy.get('#telephone1').type('07701234560')
  }

  socialContactInvalidTelephoneLogDetails = () => {
    cy.get('#firstName').type('John')
    cy.get('#lastName').type('Doe')
    cy.get('input[value="dateofbirth"]').check({ force: true })
    cy.get('#dob-day').type('01')
    cy.get('#dob-month').type('01')
    cy.get('#dob-year').type('1990')
    cy.get('#relationship').select(1)
    cy.get('#telephone1').type('invalid')
  }

  socialPinPhoneContactLogDetails = () => {
    cy.get('#firstName').type('John')
    cy.get('#lastName').type('Doe')
    cy.get('input[value="dateofbirth"]').check({ force: true })
    cy.get('#dob-day').type('01')
    cy.get('#dob-month').type('01')
    cy.get('#dob-year').type('1990')
    cy.get('#relationship').select('Cousin')
    cy.get('#addressline1').type('123 Main St')
    cy.get('#townorcity').type('London')
    cy.get('#postcode').type('SW1A 1AA')
    cy.get('#country').invoke('val', 'GB').trigger('change')

    cy.get('#telephone1').type('07701234567')
  }

  removePinPhoneContactLogDetails = () => {
    cy.get('#firstName').type('John')
    cy.get('#lastName').type('Doe')
    cy.get('#telephone1').type('07701234560')
    cy.get('#relationship').type('Friend')
  }
}
