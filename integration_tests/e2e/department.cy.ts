import DepartmentPage from '../pages/department'
import Page from '../pages/page'

context('Department Page', () => {
  let page: DepartmentPage

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT' })

    cy.visit('/log/department')

    cy.enterPrisonerDetails()
    cy.selectGroup('Pin Phone Contact Apps')
    cy.selectApplicationType('Add new social PIN phone contact')

    page = Page.verifyOnPage(DepartmentPage)
  })

  it('should display the page title', () => {
    page.pageTitle().should('include', 'Select department')
  })

  it('should display the back link', () => {
    page.backLink().should('exist').and('have.text', 'Back')
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
