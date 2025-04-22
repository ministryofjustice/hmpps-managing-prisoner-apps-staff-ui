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

  prisonerLocation = () => cy.get('.govuk-summary-list__row').contains('Location').next()

  submittedOn = () => cy.get('.govuk-summary-list__row').contains('Date sent').next()

  applicationId = () => cy.get('.govuk-summary-list__row').contains('Application ID').next()

  forwardApplication = () => cy.get('.govuk-summary-list__row').contains('Department').parent().find('a')

  commentsTab = () => cy.contains('.moj-sub-navigation__link', 'Comments')

  actionAndReplyTab = () => cy.contains('.moj-sub-navigation__link', 'Action and reply')

  historyTab = () => cy.contains('.moj-sub-navigation__link', 'History')

  emergencyPinPhonePageTitle = () => cy.title()

  emergencyPinPhoneApplicationType = () => cy.get('.govuk-summary-list__row').contains('Application type').next()

  emergencyCreditHeading = () => cy.get('h2.govuk-heading-m').contains('Emergency credit to add')
}
