import Page from './page'

export default class ActionAndReplyPage extends Page {
  constructor() {
    super('Action and reply')
  }

  pageTitle = () => cy.title()
}
