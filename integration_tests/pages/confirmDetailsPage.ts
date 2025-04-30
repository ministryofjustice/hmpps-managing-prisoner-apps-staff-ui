import Page from './page'

export default class ConfirmDetailsPage extends Page {
  constructor() {
    super('Check details')
  }

  backLink = () => cy.get('.govuk-back-link')

  pageTitle = () => cy.title()

  applicationType = () => cy.get('.govuk-summary-list__row').contains('Application type').next()

  changeApplicationType = () => cy.get('.govuk-summary-list__row').contains('Application type').parent().find('a')

  prisonerName = () => cy.get('.govuk-summary-list__row').contains('Prisoner').next()

  changePrisoner = () => cy.contains('h2', 'Application details').parent().find('a:contains("Change")')

  submittedOn = () => cy.get('.govuk-summary-list__row').contains('Submitted on').next()

  changeSubmittedOn = () => cy.get('.govuk-summary-list__row').contains('Submitted on').parent().find('a')

  swapVOsDetails = () => cy.get('.govuk-summary-list__row').contains('Details').next()

  changeSwapVOsDetails = () => cy.get('.govuk-summary-list__row').contains('Details').parent().find('a')

  continueButton = () => cy.get('.govuk-button--primary')
}
