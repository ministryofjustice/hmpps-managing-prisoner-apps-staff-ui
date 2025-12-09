import Page from './page'

export default class DepartmentPage extends Page {
  constructor() {
    super('Select department')
  }

  pageTitle = () => cy.title()

  backLink = () => cy.get('.govuk-back-link')

  radioButton = () => cy.get('.govuk-radios__item')

  continueButton = () => cy.get('.govuk-button')

  errorSummary = () => cy.get('.govuk-error-summary')

  errorMessage = () => cy.get('.govuk-error-message')

  departmentLabel = () => cy.contains('label', 'Business Hub')
}
