import Page from './page'

export default class ApplicationGroupPage extends Page {
  constructor() {
    super('Select application group')
  }

  pageTitle = () => cy.title()

  backLink = () => cy.get('.govuk-back-link')

  radioButton = () => cy.get('input[type="radio"][name="group"]')

  applicationGroupLabel = () => cy.contains('label', 'Pin Phone Contact Apps')

  submitButton = () => cy.get('button[type="submit"]')

  errorSummary = () => cy.get('.govuk-error-summary')

  errorMessage = () => cy.get('.govuk-error-message')
}
