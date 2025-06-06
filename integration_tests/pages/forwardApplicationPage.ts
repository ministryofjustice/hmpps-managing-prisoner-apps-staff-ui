import Page from './page'

export default class ForwardApplicationPage extends Page {
  constructor() {
    super('Forward this application')
  }

  pageTitle = () => cy.title()

  forwardToDepartment = () => cy.get('.govuk-radios')

  forwardingReason = () => cy.get('#forwarding-reason')

  continueButton = () => cy.get('button.govuk-button--primary')

  errorSummary = () => cy.get('.govuk-error-summary')

  selectForwardToDepartment = (department: string) => {
    this.forwardToDepartment().find(`input[value="${department}"]`).check()
  }

  caption = () => cy.get('.govuk-caption-xl')
}
