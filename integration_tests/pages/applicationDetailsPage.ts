import Page from './page'

export default class ApplicationDetailsPage extends Page {
  constructor() {
    super('Log details')
  }

  backLink = () => cy.get('.govuk-back-link')

  appTypeTitle = () => cy.get('.govuk-caption-xl')

  pageTitle = () => cy.title()

  swapVosHintText = () => cy.get('#swap-vos-pin-credit-details-hint')

  swapVosFormLabel = () => cy.get('label[for="swap-vos-pin-credit-details"]')

  swapVosTextArea = () => cy.get('#swap-vos-pin-credit-details')

  emergencyPinCreditAmountHintText = () => cy.get('#amount-hint')

  emergencyPinCreditHintTextArea = () => cy.get('#add-emergency-pin-phone-credit-details-hint')

  emergencyPinCreditFormLabel = () => cy.get('label[for="add-emergency-pin-phone-credit-details"]')

  emergencyPinCreditTextArea = () => cy.get('#add-emergency-pin-phone-credit-details')

  csrfToken = () => cy.get('input[name="_csrf"]')

  continueButton = () => cy.get('.govuk-button--primary')
}
