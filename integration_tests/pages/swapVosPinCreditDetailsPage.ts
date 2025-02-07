import Page from './page'

export default class SwapVosPinCreditDetailsPage extends Page {
  constructor() {
    super('Log details')
  }

  backLink = () => cy.get('.govuk-back-link')

  appTypeTitle = () => cy.get('.govuk-caption-xl')

  pageTitle = () => cy.title()

  hintText = () => cy.get('#swap-vos-pin-credit-details-hint')

  formLabel = () => cy.get('label[for="swap-vos-pin-credit-details"]')

  textArea = () => cy.get('#swap-vos-pin-credit-details')

  csrfToken = () => cy.get('input[name="_csrf"]')

  continueButton = () => cy.get('.govuk-button--primary')
}
