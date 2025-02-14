import Page from './page'

export default class SubmitSwapVosPinCreditApplicationPage extends Page {
  constructor() {
    super('Application submitted')
  }

  panelTitle = () => cy.get('.govuk-panel__title')

  panelBody = () => cy.get('.govuk-panel__body')

  submissionText = () => cy.get('.govuk-body-l')

  bulletPoints = () => cy.get('.govuk-list--bullet')

  viewApplicationLink = () => cy.get('a[href^="/view/"]')

  addAnotherApplicationLink = () => cy.contains('a', 'Add another application')

  dashboardLink = () => cy.contains('a', 'Return to applications dashboard')
}
