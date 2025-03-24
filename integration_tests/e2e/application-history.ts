import TestData from '../../server/routes/testutils/testData'
import Page from '../pages/page'
import ApplicationHistoryPage from '../pages/applicationHistoryPage'

context('Application History Page', () => {
  let page: ApplicationHistoryPage
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

    cy.visit(`/applications/${prisonerId}/${applicationId}/history`)

    page = Page.verifyOnPage(ApplicationHistoryPage)
  })

  it('should display the page title', () => {
    page.pageTitle().should('include', 'Swap visiting orders (VOs) for PIN credit')
  })

  it('should display the History section', () => {
    page
      .historyTab()
      .should('exist')
      .and('contain.text', 'History')
      .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/history')
  })

  it('should display the text', () => {
    page.pageText().should('exist').and('contain.text', 'History of this application')
  })
})
