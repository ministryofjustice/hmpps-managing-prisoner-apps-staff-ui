import DepartmentPage from '../pages/department'
import Page from '../pages/page'

context('Department Page', () => {
  let page: DepartmentPage

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: '3' })

    cy.visit('/log/department')

    cy.enterPrisonerDetails()
    cy.selectGroup('Pin Phone Contact Apps')
    cy.selectApplicationType('Add a social PIN phone contact')

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
      page.radioButton().should('have.length', departments.length)

      page.radioButton().each(($el, idx) => {
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
    page
      .continueButton()
      .should('exist')
      .invoke('text')
      .should('satisfy', text => text.trim() === 'Continue')
  })

  it('should show error message when no department selected', () => {
    page.continueButton().click()
    page.errorSummary().should('exist').and('contain', 'Choose a department')
    page.errorMessage().should('exist').and('contain', 'Choose a department')
  })

  it('should successfully select a department and redirect to logging method page', () => {
    page.departmentLabel().click()
    page.continueButton().click()
    cy.url().should('include', '/log/method')
  })
})
