import Page from './page'

export default class ViewApplicationPage extends Page {
  constructor(title: string) {
    super(title)
  }

  pageTitle = () => cy.title()

  applicationType = () => cy.get('.govuk-summary-list__row').contains('Application type').next()

  applicationStatus = () => cy.get('.govuk-summary-list__row').contains('Status').next()

  department = () => cy.get('.govuk-summary-list__row').contains('Department').next()

  prisonerName = () => cy.get('.govuk-summary-list__row').contains('Prisoner').next()

  prisonerCellLocation = () => cy.get('.govuk-summary-list__row').contains('Location').next()

  submittedOn = () => cy.get('.govuk-summary-list__row').contains('Date').next()

  forwardApplication = () => cy.get('.govuk-summary-list__row').contains('Department').parent().find('a')

  commentsTab = () => cy.contains('.moj-sub-navigation__link', 'Comments')

  actionAndReplyTab = () => cy.contains('.moj-sub-navigation__link', 'Action and reply')

  historyTab = () => cy.contains('.moj-sub-navigation__link', 'History')

  viewProfileLink = () => cy.contains('a', 'View profile')

  viewAlertsLink = () => cy.contains('a', 'View alerts')

  summaryListRowKey(keyText: string) {
    return cy.get('.govuk-summary-list__key').contains(keyText)
  }
}
