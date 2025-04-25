import Page from './page'

export default class CommentsPage extends Page {
  constructor() {
    super('Comments')
  }

  pageTitle = () => cy.title()

  subNavigation = () => cy.get('.moj-sub-navigation')

  activeTab = () => cy.get('.moj-sub-navigation__item a[aria-current="page"]')

  commentBox = () => cy.get('#comment')

  submitButton = () => cy.get('button.govuk-button--primary')

  comments = () => cy.get('.app-messages')
}
