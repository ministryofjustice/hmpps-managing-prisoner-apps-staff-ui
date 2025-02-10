import Page from './page'

export default class ConfirmSwapVosPinCreditDetailsPage extends Page {
  constructor() {
    super('Check details')
  }

  backLink = () => cy.get('.govuk-back-link')

  pageTitle = () => cy.title()

  applicationType = () => cy.get('.govuk-summary-list__row').contains('Application Type').next()

  changeApplicationType = () => cy.get('.govuk-summary-list__row').contains('Application Type').parent().find('a')

  prisonerName = () => cy.get('.govuk-summary-list__row').contains('Prisoner').next()

  changePrisoner = () => cy.get('.govuk-summary-list__row').contains('Prisoner').parent().find('a')

  submittedOn = () => cy.get('.govuk-summary-list__row').contains('Submitted on').next()

  changeSubmittedOn = () => cy.get('.govuk-summary-list__row').contains('Submitted on').parent().find('a')

  swapVOsDetails = () => cy.get('.govuk-summary-list__row').contains('Details').next()

  changeSwapVOsDetails = () => cy.get('.govuk-summary-list__row').contains('Details').parent().find('a')

  continueButton = () => cy.get('.govuk-button--primary')
}
