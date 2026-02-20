context('Check details page - webcam flow', () => {
  beforeEach(() => {
    cy.resetAndSignIn()

    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: '7' })

    cy.visit('/log/prisoner-details')
    cy.enterPrisonerDetails()

    cy.url().should('include', '/log/group')
    cy.selectGroup('Pin Phone Contact Apps')

    cy.url().should('include', '/log/application-type')
    cy.selectApplicationType('Make a general PIN phone enquiry')

    cy.url().should('include', '/log/department')
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
    cy.get('textarea').type('Test additional details')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/log/confirm')
  })

  it('should display check details page correctly', () => {
    cy.contains('h1', 'Check details').should('be.visible')
  })

  it('should show method with change link', () => {
    cy.contains('dt', 'Method')
      .parent()
      .within(() => {
        cy.contains('Take a photo of the application')
        cy.contains('a', 'Change').should('have.attr', 'href', '/log/method')
      })
  })

  it('should show Image 1 with retake and remove links', () => {
    cy.contains('dt', 'Image 1')
      .parent()
      .within(() => {
        cy.get('img').should('exist')
        cy.contains('a', 'Retake').should('have.attr', 'href', '/log/photo-capture?retake=photo1')
        cy.contains('a', 'Remove').should('have.attr', 'href', '/log/remove-photo?photo=photo1')
      })
  })

  it('should show Image 2 (optional) with upload link', () => {
    cy.contains('dt', 'Image 2 (optional)')
      .parent()
      .within(() => {
        cy.contains('Not uploaded')
        cy.contains('a', 'Upload').should('have.attr', 'href', '/log/photo-capture?image=2')
      })
  })

  it('should show additional details with change link', () => {
    cy.contains('dt', 'Additional details')
      .parent()
      .within(() => {
        cy.contains('Test additional details')
        cy.contains('a', 'Change').should('have.attr', 'href', '/log/additional-photo-details')
      })
  })

  it('should have enabled Submit application button', () => {
    cy.get('button').contains('Submit application').should('not.be.disabled')
  })

  it('should not show warning when photo is uploaded', () => {
    cy.contains('You cannot save this application').should('not.exist')
  })
})
