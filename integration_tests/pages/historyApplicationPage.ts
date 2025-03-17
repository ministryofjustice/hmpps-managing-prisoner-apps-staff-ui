import Page from './page'

export default class HistorySwapVosPinCreditApplicationPage extends Page {
  constructor() {
    super('Swap visiting orders (VOs) for PIN credit')
  }

  pageTitle = () => cy.title()

  historyTab = () => cy.contains('.moj-sub-navigation__link', 'History')

  pageText = () => cy.get('h2.govuk-heading-m')
}
