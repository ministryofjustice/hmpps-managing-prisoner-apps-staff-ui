import Page from './page'

export default class ApplicationHistoryPage extends Page {
  constructor() {
    super('History')
  }

  pageTitle = () => cy.get('h1')

  historyTab = () => cy.contains('.moj-sub-navigation__link', 'History')

  pageCaption = () => cy.get('.govuk-caption-xl')
}
