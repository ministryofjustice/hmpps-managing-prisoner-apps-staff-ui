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

  textArea = () => cy.get('#details')

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
}
