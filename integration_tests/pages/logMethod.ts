import Page from './page'

export default class LogMethodPage extends Page {
  constructor() {
    super('Select method to log this application')
  }

  pageTitle = () => cy.title()

  backLink() {
    return cy.get('.govuk-back-link')
  }

  radioButtons() {
    return cy.get('input[name="loggingMethod"]')
  }

  manualOption() {
    return cy.get('input[value="manual"]')
  }

  webcamOption() {
    return cy.get('input[value="webcam"]')
  }

  submitButton() {
    return cy.get('button[type="submit"]')
  }

  errorSummary() {
    return cy.get('.govuk-error-summary')
  }

  errorMessage() {
    return cy.get('.govuk-error-message')
  }
}
