import TestData from '../../server/routes/testutils/testData'
import Page from '../pages/page'
import ViewApplicationPage from '../pages/viewApplicationPage'

context('View Application Page', () => {
  let page: ViewApplicationPage
  const { prisonerApp: application } = new TestData()
  const {
    id: applicationId,
    requestedBy: { username: prisonerId },
  } = application

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerApp', {
      prisonerId,
      applicationId,
      application,
    })
    cy.signIn()

    cy.visit(`/applications/${prisonerId}/${applicationId}`)

    page = Page.verifyOnPage(ViewApplicationPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Swap visiting orders (VOs) for PIN credit')
  })

  it('should display the application type correctly', () => {
    page.applicationType().should('contain.text', 'Swap visiting orders (VOs) for PIN credit')
  })

  it('should display the application status', () => {
    page.applicationStatus().should('exist')
  })

  it('should display the department handling the application', () => {
    page.department().should('exist')
  })

  it('should display the prisoner name', () => {
    page.prisonerName().should('exist')
  })

  it('should display the prisoner location', () => {
    page.prisonerLocation().should('exist')
  })

  it('should display the date the application was submitted', () => {
    page.submittedOn().should('exist')
  })

  it('should display the application ID', () => {
    page.applicationId().should('exist')
  })

  it('should allow navigating to the Comments section', () => {
    page
      .commentsTab()
      .should('exist')
      .and('contain.text', 'Comments')
      .and('have.attr', 'href', '/applications/business-hub/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/comments')
  })

  it('should allow navigating to the Action and Reply section', () => {
    page
      .actionAndReplyTab()
      .should('exist')
      .and('contain.text', 'Action and reply')
      .and('have.attr', 'href', '/applications/business-hub/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/reply')
  })

  it('should allow navigating to the History section', () => {
    page
      .historyTab()
      .should('exist')
      .and('contain.text', 'History')
      .and('have.attr', 'href', '/applications/business-hub/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/history')
  })
})
