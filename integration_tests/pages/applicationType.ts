import Page from './page'

export default class ApplicationTypePage extends Page {
  constructor() {
    super('Select application type')
  }

  pageTitle = () => cy.title()

  backLink = () => cy.get('.govuk-back-link')
}
