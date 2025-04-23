import TestData from '../../server/routes/testutils/testData'
import ViewApplicationPage from '../pages/viewApplicationPage'

context('View Application Page - Swap visiting orders (VOs) for PIN credit', () => {
  let page: ViewApplicationPage
  const { app } = new TestData()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerApp', {
      app,
    })
    cy.signIn()

    cy.visit(`/applications/${app.requestedBy.username}/${app.id}`)

    page = new ViewApplicationPage('Swap visiting orders (VOs) for PIN credit')
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
      .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/comments')
  })

  it('should allow navigating to the Action and Reply section', () => {
    page
      .actionAndReplyTab()
      .should('exist')
      .and('contain.text', 'Action and reply')
      .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/reply')
  })

  it('should allow navigating to the History section', () => {
    page
      .historyTab()
      .should('exist')
      .and('contain.text', 'History')
      .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/history')
  })
})

context('View Application Page - Add emergency PIN phone credit', () => {
  let page: ViewApplicationPage
  const { app: originalApp } = new TestData()
  const app = { ...originalApp, appType: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP' }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerApp', { app })
    cy.signIn()

    cy.visit(`/applications/${app.requestedBy.username}/${app.id}`)

    page = new ViewApplicationPage('Add emergency PIN phone credit')
  })

  it('should display the correct page title', () => {
    page.emergencyPinPhonePageTitle().should('include', 'Add emergency PIN phone credit')
  })

  it('should display the application type correctly', () => {
    page.emergencyPinPhoneApplicationType().should('contain.text', 'Add emergency PIN phone credit')
  })

  it('should display the emergency credit section heading', () => {
    page.emergencyCreditHeading().should('exist')
  })
})
