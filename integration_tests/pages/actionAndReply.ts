import Page from './page'

export default class ActionAndReplyPage extends Page {
  constructor() {
    super('Action and reply')
  }

  pageTitle = () => cy.title()

  selectAction = () => cy.get('.govuk-radios')

  actionReplyReason = () => cy.get('#action-and-reply-reason')

  replyButton = () => cy.get('button.govuk-button--primary')
}
