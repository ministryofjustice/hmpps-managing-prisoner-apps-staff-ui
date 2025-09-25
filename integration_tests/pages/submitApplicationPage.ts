import Page from './page'

export default class SubmitApplicationPage extends Page {
  constructor() {
    super('Application submitted')
  }

  panelTitle = () => cy.get('.govuk-panel__title')

  panelBody = () => cy.get('.govuk-panel__body')

  submissionText = () => cy.get('.govuk-body-l')

  bulletPoints = () => cy.get('.govuk-list--bullet')

  logAnotherApplicationForSamePrisonerLink = () =>
    cy.get('a[href*="/log/application-type?isLoggingForSamePrisoner=true"]')

  logNewApplicationLink = () => cy.get('a[href="/log/prisoner-details"]')

  viewApplicationLink = (app: { requestedBy: { username: string }; id: string }) =>
    cy.get(`a[href="/applications/${app.requestedBy.username}/${app.id}"]`)

  viewAllApplicationsLink = () => cy.get(`a[href^="/applications"]`)
}
