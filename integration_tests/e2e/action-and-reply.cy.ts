import TestData from '../../server/routes/testutils/testData'
import ActionAndReplyPage from '../pages/actionAndReply'
import Page from '../pages/page'

context('Action and Reply Page', () => {
  let page: ActionAndReplyPage
  const { prisonerApp: application } = new TestData()
  const {
    id: applicationId,
    requestedBy: { username: prisonerId },
  } = application

  const visitPage = () => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerApp', { prisonerId, applicationId, application })
    cy.signIn()
    cy.visit(`/applications/business-hub/${prisonerId}/${applicationId}/reply`)
    page = Page.verifyOnPage(ActionAndReplyPage)
  }

  beforeEach(visitPage)

  describe('Page structure', () => {
    it('should display the correct page title', () => {
      page.pageTitle().should('include', 'Action and reply')
    })

    it('should display all form elements', () => {
      page.selectAction().should('exist')
      page.actionReplyReason().should('exist')
      page.replyButton().should('exist').and('contain.text', 'Reply')
    })
  })
})
