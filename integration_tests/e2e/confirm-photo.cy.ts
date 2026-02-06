import ConfirmPhotoPage from '../pages/confirmPhoto'
import Page from '../pages/page'

context('Confirm Photo Capture Page', () => {
  let confirmPage: ConfirmPhotoPage

  beforeEach(() => {
    cy.resetAndSignIn()

    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: '3' })

    cy.visit('/log/prisoner-details')
    cy.enterPrisonerDetails()
    cy.selectGroup('Pin Phone Contact Apps')
    cy.selectApplicationType('Add a social PIN phone contact')
    cy.selectDepartment('Business Hub')
    cy.selectLoggingMethod('webcam')
  })

  it('should redirect to photo capture if no photo in session', () => {
    cy.visit('/log/confirm-photo-capture')
    cy.url().should('include', '/log/photo-capture')
  })

  context('with photo in session', () => {
    beforeEach(() => {
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

      cy.url().should('include', '/log/confirm-photo-capture')

      confirmPage = Page.verifyOnPage(ConfirmPhotoPage)
    })

    it('should display the correct page title', () => {
      confirmPage.pageTitle().should('include', 'Confirm image')
    })

    it('should display the heading', () => {
      cy.get('h1.govuk-heading-l').should('contain.text', 'Confirm image')
    })

    it('should display the application type caption', () => {
      cy.get('.govuk-caption-xl').should('contain.text', 'Add a social PIN phone contact')
    })

    it('should display edit instructions', () => {
      confirmPage.editInstructions().should('contain.text', 'Edit the image before continuing')
    })

    it('should display the photo preview', () => {
      confirmPage.photoPreview().should('exist')
    })

    it('should have save and continue button', () => {
      confirmPage.saveAndContinue().should('exist')
    })

    it('should allow user to add a second photo and go to additional details page', () => {
      cy.get('button').contains('Save and continue').click()

      cy.url().should('include', '/log/add-another-photo')
      cy.get('input[value="yes"]').check()
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/log/photo-capture')

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
      cy.url().should('include', '/log/confirm-photo-capture')
      cy.get('button').contains('Save and continue').click()
      cy.url().should('include', '/log/additional-photo-details')
    })

    it('should navigate to additional details page when user selects No for `Do you want to add another photo?`', () => {
      cy.get('button').contains('Save and continue').click()

      cy.url().should('include', '/log/add-another-photo')

      cy.get('input[value="no"]').check()
      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/log/additional-photo-details')
    })

    it('should show validation error if no option is selected on Add Another Photo page', () => {
      cy.get('button').contains('Save and continue').click()

      cy.url().should('include', '/log/add-another-photo')

      cy.get('button[type="submit"]').click()

      cy.get('.govuk-error-summary').should(
        'contain.text',
        'You need to select if you want to take another photo of the application.',
      )

      cy.get('#addAnotherPhoto-error').should('contain.text', 'Select one')
    })
  })
})
