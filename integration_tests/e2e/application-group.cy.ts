import ApplicationGroupPage from '../pages/applicationGroup'
import Page from '../pages/page'

context('Application Group Page', () => {
  let page: ApplicationGroupPage

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')

    cy.visit('/log/group')

    cy.enterPrisonerDetails()

    page = Page.verifyOnPage(ApplicationGroupPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Select application group')
  })

  it('should display the back link', () => {
    page.backLink().should('exist').and('have.text', 'Back')
  })
})
