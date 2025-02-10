import Page from './page'

export default class LogPrisonerDetailsPage extends Page {
  constructor() {
    super('Log prisoner details')
  }

  backLink = () => cy.get('.govuk-back-link')

  pageTitle = () => cy.title()

  form = () => cy.get('form#log-prisoner-details')

  csrfToken = () => cy.get('input[name="_csrf"]')

  prisonNumberInput = () => cy.get('input#prison-number')

  findPrisonerButton = () => cy.get('[data-test="find-prisoner-button"]')

  prisonerNameInsetText = () => cy.get('.govuk-inset-text')

  dateInput = () => cy.get('#date')

  dateLabel = () => cy.get('label[for="date"]')

  continueButton = () => cy.get('[data-test="continue-button"]')
}
