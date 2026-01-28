import LogMethodPage from '../pages/logMethod'
import Page from '../pages/page'

context('Logging Method Page', () => {
  let page: LogMethodPage

  beforeEach(() => {
    cy.resetAndSignIn()

    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: '3' })
    cy.visit('/log/department')
    cy.enterPrisonerDetails()
    cy.selectGroup('Pin Phone Contact Apps')
    cy.selectApplicationType('Add a social PIN phone contact')
    cy.selectDepartment('Business Hub')

    cy.visit('/log/method')

    page = Page.verifyOnPage(LogMethodPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Select method to log this application')
  })

  it('should display the back link', () => {
    page.backLink().should('exist').and('have.text', 'Back')
  })

  it('should display radio buttons for logging methods', () => {
    page.radioButtons().should('have.length', 2)
  })

  it('should display "Enter details manually" option', () => {
    page.manualOption().should('exist')
  })

  it('should display "Upload image of the paper application" option', () => {
    page.webcamOption().should('exist')
  })

  it('should show validation error when no method selected', () => {
    page.submitButton().click()

    page.errorSummary().should('contain', 'You need to select a method to log the application')
    page.errorMessage().should('contain', 'Select one')
  })

  it('should redirect to application details when manual is selected', () => {
    page.manualOption().click()
    page.submitButton().click()

    cy.url().should('include', '/log/application-details')
  })

  it('should redirect to photo capture when upload an imageis selected', () => {
    page.webcamOption().click()
    page.submitButton().click()

    cy.url().should('include', '/log/photo-capture')
  })
})
