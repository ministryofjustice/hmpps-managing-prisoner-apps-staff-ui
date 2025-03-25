import TestData from '../../server/routes/testutils/testData'
import CommentsPage from '../pages/comments'
import Page from '../pages/page'

context('Comments Page', () => {
  let page: CommentsPage
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
    cy.visit(`/applications/${prisonerId}/${applicationId}/comments`)
    page = Page.verifyOnPage(CommentsPage)
  }

  beforeEach(visitPage)

  describe('Page structure', () => {
    it('should display the correct page title', () => {
      page.pageTitle().should('include', 'Comments')
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
      page.noCommentsMessage().should('exist').and('contain.text', 'None')
    })
  })
})
