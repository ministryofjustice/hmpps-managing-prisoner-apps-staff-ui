import Page from './page'

export default class SubmitApplicationPage extends Page {
  constructor() {
    super('Application submitted')
  }

  panelTitle = () => cy.get('.govuk-panel__title').contains('Application submitted')

  panelBody = (applicationType: string) => cy.get('.govuk-panel__body').contains(applicationType)

  submissionText = (groupName: string) => cy.get('.govuk-body-l').contains(`${groupName} now has this application.`)

  bulletPoints = () => cy.get('.govuk-list--bullet')

  logAnotherApplicationForSamePrisonerLink = (prisonerName: string) =>
    cy.get(`a[href="/log/group?isLoggingForSamePrisoner=true"]`).contains(`another application for ${prisonerName}`)

  logNewApplicationLink = () => cy.get(`a[href="/log/prisoner-details"]`).contains('a new application')

  viewApplicationLink = (app: { requestedBy: { username: string }; id?: string }) =>
    cy.get(`a[href="/applications/${app.requestedBy.username}/${app.id}"]`).contains('this application')

  viewAllApplicationsLink = () => cy.get(`a[href="/applications"]`).contains('all applications')
}
