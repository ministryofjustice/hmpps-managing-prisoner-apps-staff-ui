import Page from './page'

export default class ActionAndReplyPage extends Page {
  constructor() {
    super('Action and reply')
  }

  pageTitle = () => cy.title()

  actionRadios = () => cy.get('.govuk-radios')

  selectAction = (action: 'APPROVED' | 'DECLINED') => cy.get(`input[name="decision"][value="${action}"]`).check()

  reasonInput = () => cy.get('#action-and-reply-reason')

  saveButton = () => cy.get('.govuk-button.govuk-button--primary')

  errorSummary = () => cy.get('.govuk-error-summary')

  errorMessage = () => cy.get('.govuk-error-message')

  summaryList = () => cy.get('.govuk-summary-list')

  printButton = () => cy.get('#print-button')
}
