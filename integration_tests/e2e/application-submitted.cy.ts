import TestData from '../../server/routes/testutils/testData'
import Page from '../pages/page'
import SubmitApplicationPage from '../pages/submitApplicationPage'

context('Application Submitted Page', () => {
  let page: SubmitApplicationPage
  const { app } = new TestData()

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerApp', {
      app,
    })
    cy.task('stubGetAppTypes')

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
    page.logAnotherApplicationForSamePrisonerLink().should('contain.text', 'another application for')
    page.logNewApplicationLink().should('contain.text', 'a new application')
    page.viewApplicationLink(app).should('exist').and('contain.text', 'this application')
    page.viewAllApplicationsLink().should('contain.text', 'all applications')
  })
})
