import TestData from '../../server/routes/testutils/testData'

context('Department Page', () => {
  const { app } = new TestData()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')

    cy.signIn()

    cy.task('stubGetPrisonerApp', { app })

    cy.task('stubGetDepartments', { appType: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS' })

    cy.visitIndexAndStartApplication()
    cy.enterPrisonerDetails()
    cy.selectApplicationType('Swap visiting orders (VOs) for PIN credit')
  })

  it('should display the page title', () => {
    cy.title().should('include', 'Select department')
  })

  it('should display the back link', () => {
    cy.get('.govuk-back-link').should('exist').and('have.text', 'Back')
  })

  it('should display radio buttons with department names', () => {
    cy.fixture('departments.json').then(({ departments }) => {
      cy.get('.govuk-radios__item').should('have.length', departments.length)

      cy.get('.govuk-radios__item').each(($el, idx) => {
        const deptName = departments[idx].name

        cy.wrap($el)
          .find('label.govuk-label.govuk-radios__label')
          .should('exist')
          .invoke('text')
          .then(text => {
            expect(text.trim()).to.equal(deptName)
          })

        cy.wrap($el).find('input.govuk-radios__input').should('exist').and('have.attr', 'value', deptName)
      })
    })
  })

  it('should display the continue button', () => {
    cy.get('.govuk-button')
      .should('exist')
      .invoke('text')
      .should('satisfy', text => text.trim() === 'Continue')
  })

  it('should show error message when no department selected and form submitted', () => {
    cy.get('.govuk-button').click()
    cy.get('.govuk-error-summary').should('exist').and('contain', 'Choose a department')
    cy.get('.govuk-error-message').should('exist').and('contain', 'Choose a department')
  })
})
