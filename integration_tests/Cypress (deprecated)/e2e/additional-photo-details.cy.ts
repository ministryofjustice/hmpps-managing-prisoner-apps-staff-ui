import AdditionalPhotoDetailsPage from '../pages/additionalPhotoDetails'
import Page from '../pages/page'

context('Additional Photo Details Page', () => {
  let additionalPhotoDetailsPage: AdditionalPhotoDetailsPage

  beforeEach(() => {
    cy.resetAndSignIn()

    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: '7' })
    cy.visit('/log/prisoner-details')
    cy.enterPrisonerDetails()
    cy.selectGroup('Pin Phone Contact Apps')
    cy.selectApplicationType('Make a general PIN phone enquiry')
    cy.selectDepartment('Business Hub')
    cy.selectLoggingMethod('webcam')

    cy.visit('/log/photo-capture')

    cy.fixture('test-image.jpg', 'base64').then(fileContent => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg')
      const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      cy.get('input[type="file"]').then($input => {
        const input = $input[0] as HTMLInputElement
        input.files = dataTransfer.files

        cy.wrap($input).trigger('change', { force: true })
      })
    })

    cy.get('form').submit()
    cy.visit('/log/add-another-photo')

    cy.get('input[value="no"]').check()
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/log/additional-photo-details')

    additionalPhotoDetailsPage = Page.verifyOnPage(AdditionalPhotoDetailsPage)
  })

  it('should display correct page content', () => {
    additionalPhotoDetailsPage.heading().should('contain.text', 'Enter additional details')
    additionalPhotoDetailsPage.caption().should('contain.text', 'Make a general PIN phone enquiry')
    additionalPhotoDetailsPage
      .detailsLabel()
      .should('contain.text', 'Add additional details about this application (optional)')
    additionalPhotoDetailsPage.textArea().should('exist')
    additionalPhotoDetailsPage.continueButton().should('exist')
  })

  it('should show validation error when details exceed max length', () => {
    cy.get('#additionalDetails').type('a'.repeat(1001))
    cy.get('button').contains('Continue').click()

    cy.get('.govuk-error-summary').should('exist')
  })
})
