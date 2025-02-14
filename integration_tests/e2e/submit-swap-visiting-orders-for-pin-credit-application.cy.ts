import Page from '../pages/page'
import SubmitSwapVosPinCreditApplicationPage from '../pages/submitSwapVosPinCreditApplicationPage'

context('Swap VOs for PIN Credit - Application Submitted Page', () => {
  let page: SubmitSwapVosPinCreditApplicationPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.visit('/submit/12345')

    page = Page.verifyOnPage(SubmitSwapVosPinCreditApplicationPage)
  })

  it('should display the panel title and body', () => {
    page.panelTitle().should('contain.text', 'Application submitted')
    page.panelBody().should('contain.text', 'Swap VOs for PIN credit')
  })

  it('should display submission text with department info', () => {
    page.submissionText().should('contain.text', 'now has this application.')
  })

  it('should contain correct bullet point links', () => {
    page.bulletPoints().should('exist')

    page
      .viewApplicationLink()
      .should('exist')
      .and('have.text', 'View this application')
      .and('have.attr', 'href')
      .and('include', '/view/')
    page.addAnotherApplicationLink().should('exist').and('have.text', 'Add another application')
    page.dashboardLink().should('exist').and('have.text', 'Return to applications dashboard')
  })
})
