import Page from './page'

export default class ApplicationTypePage extends Page {
  constructor() {
    super('Select application type')
  }

  pageTitle = () => cy.title()

  backLink = () => cy.get('.govuk-back-link')

  radioButton = () => cy.get('.govuk-radios__item')

  continueButton = () => cy.get('.govuk-button')

  radioButtonOrDivider = () => cy.get('.govuk-radios__divider')

  errorSummary = () => cy.get('.govuk-error-summary')

  errorMessage = () => cy.get('.govuk-error-message')

  appTypeLabel = () => cy.contains('label', 'Add a social PIN phone contact')
}
