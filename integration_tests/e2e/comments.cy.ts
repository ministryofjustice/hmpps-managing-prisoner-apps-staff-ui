import TestData from '../../server/routes/testutils/testData'
import CommentsPage from '../pages/comments'
import Page from '../pages/page'

context('Comments Page', () => {
  let page: CommentsPage
  const { app } = new TestData()

  const visitPage = () => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerApp', { app })
    cy.signIn()
    cy.visit(`/applications/${app.requestedBy.username}/${app.id}/comments`)
    page = Page.verifyOnPage(CommentsPage)
  }

  beforeEach(visitPage)

  describe('Page structure', () => {
    it('should display the correct page title', () => {
      page.pageTitle().should('include', 'Swap visiting orders (VOs) for PIN credit')
    })

    it('should highlight the Comments tab as active in sub-navigation', () => {
      page.subNavigation().should('exist')
      page.activeTab().should('contain.text', 'Comments')
    })

    it('should display the comment form', () => {
      page.commentBox().should('exist')
      page.submitButton().should('exist').and('contain.text', 'Continue')
    })

    it('should display a message when there are no comments', () => {
      page.comments().should('exist')
    })
  })
})
