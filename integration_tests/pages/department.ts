import Page from './page'

export default class DepartmentPage extends Page {
  constructor() {
    super('Select department')
  }

  pageTitle = () => cy.title()

  backLink = () => cy.get('.govuk-back-link')
}
