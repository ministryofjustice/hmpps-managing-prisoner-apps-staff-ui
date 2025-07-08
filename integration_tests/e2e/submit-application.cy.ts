import TestData from '../../server/routes/testutils/testData'
import Page from '../pages/page'
import SubmitApplicationPage from '../pages/submitApplicationPage'

context('Application Submitted Page', () => {
  let page: SubmitApplicationPage
  const { app } = new TestData()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerApp', {
      app,
    })
    cy.task('stubGetAppTypes')
    cy.signIn()

    cy.visit(`/log/submit/${app.requestedBy.username}/${app.id}`)

    page = Page.verifyOnPage(SubmitApplicationPage)
  })

  it('should display the panel title and body', () => {
    page.panelTitle().should('contain.text', 'Application submitted')
    page.panelBody().should('contain.text', 'Swap visiting orders (VOs) for PIN credit')
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
      .and('include', `/applications/`)
    page.addAnotherApplicationLink().should('exist').and('have.text', 'Add another application')
    page.dashboardLink().should('exist').and('have.text', 'Return to applications dashboard')
  })
})
