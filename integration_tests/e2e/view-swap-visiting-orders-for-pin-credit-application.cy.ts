import Page from '../pages/page'
import ViewSwapVosPinCreditApplicationPage from '../pages/viewSwapVosPinCreditApplicationPage'

context('View Swap VOs for PIN Credit Application Page', () => {
  let page: ViewSwapVosPinCreditApplicationPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.visit('/applications/business-hub/G98765/12345')

    page = Page.verifyOnPage(ViewSwapVosPinCreditApplicationPage)
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
    page.commentsTab().should('exist').and('contain.text', 'Comments').and('have.attr', 'href', '')
  })

  it('should allow navigating to the Action and Reply section', () => {
    page.actionAndReplyTab().should('exist').and('contain.text', 'Action and reply').and('have.attr', 'href', '')
  })

  it('should allow navigating to the History section', () => {
    page.historyTab().should('exist').and('contain.text', 'History').and('have.attr', 'href', '')
  })
})
