import Page from './page'

export default class LogPrisonerDetailsPage extends Page {
  constructor() {
    super('Log prisoner details')
  }

  backLink = () => cy.get('.govuk-back-link')

  pageTitle = () => cy.title()

  caption = () => cy.get('.govuk-caption-xl')

  form = () => cy.get('form#log-prisoner-details')

  csrfToken = () => cy.get('input[name="_csrf"]')

  prisonNumberInput = () => cy.get('input#prison-number')

  findPrisonerButton = () => cy.get('[data-test="find-prisoner-button"]')

  findPrisonerButtonErrorMessage = () => cy.get('.govuk-error-message').contains('Find prisoner to continue')

  prisonerNameInsetText = () => cy.get('.govuk-inset-text')

  dateInput = () => cy.get('#date')

  dateLabel = () => cy.get('label[for="date"]')

  continueButton = () => cy.get('[data-test="continue-button"]')

  firstNightOrEarlyDaysCentre = () => cy.get('input[type="radio"]')

  firstNightOrEarlyDaysCentreLabel = () => cy.contains('Is this person in the first night or early days centre?')

  firstNightOrEarlyDaysCentreYes = () => cy.get('input[type="radio"][value="yes"]')

  firstNightOrEarlyDaysCentreNo = () => cy.get('input[type="radio"][value="no"]')

  firstNightOrEarlyDaysCentreErrorMessage = () =>
    cy.get('.govuk-error-message').contains('Select if this person is in the first night or early days centre')
}
