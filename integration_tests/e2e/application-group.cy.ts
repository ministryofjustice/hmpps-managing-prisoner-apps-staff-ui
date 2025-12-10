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

  it('should display radio buttons for application groups', () => {
    page.radioButton().should('have.length.greaterThan', 0)
  })

  it('should display "Pin Phone Contact Apps" group option', () => {
    page.applicationGroupLabel().should('exist')
  })

  it('should show validation error when no group selected', () => {
    page.submitButton().click()
    page.errorSummary().should('contain', 'Choose one application group')
    page.errorMessage().should('contain', 'Choose one application group')
  })

  it('should successfully select a group and redirect to application type', () => {
    cy.task('stubGetGroupsAndTypes')
    page.applicationGroupLabel().click()
    page.submitButton().click()
    cy.url().should('include', '/log/application-type')
  })
})
