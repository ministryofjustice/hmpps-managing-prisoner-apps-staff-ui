import TestData from '../../server/routes/testutils/testData'
import Page from '../pages/page'
import SubmitApplicationPage from '../pages/submitApplicationPage'

context('Application Submitted Page', () => {
  let page: SubmitApplicationPage
  const { app } = new TestData()
  const prisonerName = `${app.requestedBy.firstName} ${app.requestedBy.lastName}`
  const groupName = app.assignedGroup.name

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerApp', {
      app,
    })
    cy.task('stubGetGroupsAndTypes')

    cy.visit(`/log/submit/${app.requestedBy.username}/${app.id}`)

    page = Page.verifyOnPage(SubmitApplicationPage)
  })

  it('should display the panel title and body', () => {
    page.panelTitle().should('exist')
    page.panelBody('Add a social PIN phone contact').should('exist')
  })

  it('should display submission text with department info', () => {
    page.submissionText(groupName).should('exist')
  })

  it('should contain correct bullet point links', () => {
    page.bulletPoints().should('exist')

    page
      .logAnotherApplicationForSamePrisonerLink(prisonerName)
      .should('exist')
      .and('have.attr', 'href', '/log/group?isLoggingForSamePrisoner=true')

    page.logNewApplicationLink().should('exist').and('have.attr', 'href', '/log/prisoner-details')

    page
      .viewApplicationLink(app)
      .should('exist')
      .and('have.attr', 'href', `/applications/${app.requestedBy.username}/${app.id}`)

    page.viewAllApplicationsLink()
  })
})
