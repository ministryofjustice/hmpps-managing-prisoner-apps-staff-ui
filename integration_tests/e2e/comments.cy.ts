import { app } from '../../server/testData'
import CommentsPage from '../pages/comments'
import Page from '../pages/page'

context('Comments Page', () => {
  let page: CommentsPage

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerApp', { app })
    cy.task('stubGetComments', { app })
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetLegacyAppTypes')

    cy.visit(`/applications/${app.requestedBy.username}/${app.id}/comments`)

    page = Page.verifyOnPage(CommentsPage)
  })

  describe('Page structure', () => {
    it('should display the correct page title', () => {
      page.pageTitle().should('include', 'Comments')
    })

    it('should highlight the Comments tab as active in sub-navigation', () => {
      page.subNavigation().should('exist')
      page.activeTab().should('contain.text', 'Comments')
    })

    it('should display the comment form', () => {
      page.commentLabel().should('exist').and('contain.text', 'Add a comment')
      page.commentBox().should('exist')
      page.submitButton().should('exist').and('contain.text', 'Continue')
    })

    it('should display a message when there are no comments', () => {
      page.comments().should('exist')
    })
  })

  describe('Adding a comment', () => {
    it('should allow a user to add a comment and display it', () => {
      cy.task('stubAddComments', { app })
      cy.task('stubGetComments', { app })
      page.commentBox().type('This is my first comment')
      page.submitButton().click()
      cy.url().should('include', `/applications/${app.requestedBy.username}/${app.id}/comments`)
      page
        .comments()
        .should('contain.text', 'This is my first comment')
        .and('contain.text', 'Staff Name')
        .and('contain.text', '9 April 2025')
        .and('contain.text', '16:57')
    })

    it('should show error message when no comment is entered', () => {
      page.submitButton().click()
      page.errorSummary().should('exist').and('contain', 'Add a comment')
      page.errorMessage().should('exist').and('contain', 'Add a comment')
    })
  })
})
