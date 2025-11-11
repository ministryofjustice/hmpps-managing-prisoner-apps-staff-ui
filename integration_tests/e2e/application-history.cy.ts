import TestData from '../../server/routes/testutils/testData'
import ApplicationHistoryPage from '../pages/applicationHistoryPage'
import Page from '../pages/page'

context('Application History Page', () => {
  let page: ApplicationHistoryPage
  const { app } = new TestData()

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerApp', { app })
    cy.task('stubGetHistory', { app })
    cy.task('stubGetGroupsAndTypes')

    cy.visit(`/applications/${app.requestedBy.username}/${app.id}/history`, { failOnStatusCode: false })

    page = Page.verifyOnPage(ApplicationHistoryPage)
  })

  it('should display the page title', () => {
    page.pageTitle().should('include.text', 'History')
  })

  it('should display the History section', () => {
    page
      .historyTab()
      .should('exist')
      .and('contain.text', 'History')
      .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/history')
  })

  it('should display the application type name in the caption', () => {
    page.pageCaption().should('include.text', 'Add a social PIN phone contact')
  })
})
