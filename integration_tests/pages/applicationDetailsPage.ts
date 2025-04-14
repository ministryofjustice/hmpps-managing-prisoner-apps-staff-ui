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
}
