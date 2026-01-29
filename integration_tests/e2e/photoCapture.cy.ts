import PhotoCapturePage from '../pages/photoCapture'
import Page from '../pages/page'

context('Photo Capture Page', () => {
  let page: PhotoCapturePage

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

    cy.selectLoggingMethod('webcam')

    cy.visit('/log/photo-capture')

    page = Page.verifyOnPage(PhotoCapturePage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Take a photo of the application')
  })

  it('should display the back link', () => {
    page.backLink().should('exist').and('contain.text', 'Back')
  })

  it('should display photo instructions', () => {
    page.instructions().should('contain.text', 'Place the paper flat on a clear desk.')
    page.instructions().should('contain.text', 'Select "Take photo".')
  })

  it('should include a CSRF token', () => {
    page.csrfToken().should('exist')
  })
})
