import Page from './page'

export default class ApplicationGroupPage extends Page {
  constructor() {
    super('Select application group')
  }

  pageTitle = () => cy.title()

  backLink = () => cy.get('.govuk-back-link')
}
