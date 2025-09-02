import applicationTypesData from '../fixtures/applicationTypes.json'
import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import Page from '../pages/page'

const { applicationTypes } = applicationTypesData

function startApplication(appType: string): ApplicationDetailsPage {
  cy.resetAndSignIn()
  cy.task('stubGetAppTypes')

  cy.visit('/log/application-details')

  cy.selectApplicationType(appType)

  return Page.verifyOnPage(ApplicationDetailsPage)
}

applicationTypes.forEach(({ name, type, hint }) => {
  context(`Application Details Page - ${name}`, () => {
    let page: ApplicationDetailsPage

    beforeEach(() => {
      page = startApplication(name)
    })

    it('should direct the user to the correct page', () => {
      Page.verifyOnPage(ApplicationDetailsPage)
    })

    it('should render the correct app type title', () => {
      page.appTypeTitle().should('have.text', name)
    })

    if (type === 'textarea') {
      it('should render the form label', () => {
        page.formLabel().should('contain.text', 'Details (optional)')
      })

      it('should display the hint text', () => {
        page.hintText().should('contain.text', hint)
      })

      it('should have a textarea field', () => {
        page.textArea().should('exist')
      })
    }

    if (type === 'amount') {
      it('should display the hint text', () => {
        page.reasonHintText().should('contain.text', hint)
      })

      it('should have an amount input field', () => {
        page.amountInput().should('exist')
      })
    }

    it('should have CSRF token and continue button', () => {
      page.csrfToken().should('exist')
      page.continueButton().should('contain.text', 'Continue')
    })
  })
})

context(`Application Details Page - Add new social PIN contact`, () => {
  let page: ApplicationDetailsPage

  beforeEach(() => {
    page = startApplication('Add new social PIN phone contact')
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should render the correct app type title', () => {
    page.appTypeTitle().should('have.text', 'Add new social PIN phone contact')
  })

  it('should render the first night or early days centre radio buttons', () => {
    page
      .firstNightOrEarlyDaysCentreLabel()
      .should('exist')
      .and('include.text', 'Is this person in the first night or early days centre?')
    page.firstNightOrEarlyDaysCentre().should('exist')
    page.firstNightOrEarlyDaysCentreYes().should('exist')
    page.firstNightOrEarlyDaysCentreNo().should('exist')
  })

  it('should allow the user to select "No" for "Is this person in the first night or early days centre?"', () => {
    page.firstNightOrEarlyDaysCentreNo().check({ force: true })
    page.firstNightOrEarlyDaysCentreNo().should('be.checked')
  })

  it('should allow the user to select "Yes" for "Is this person in the first night or early days centre?"', () => {
    page.firstNightOrEarlyDaysCentreYes().check({ force: true })
    page.firstNightOrEarlyDaysCentreYes().should('be.checked')
  })

  it('should show an error if no radio button is selected for "Is this person in the first night or early days centre?"', () => {
    page.continueButton().click()
    page.firstNightOrEarlyDaysCentreErrorMessage().should('exist')
  })

  it('should render the form fields', () => {
    cy.get('#firstName').should('exist')
    cy.get('#lastName').should('exist')
    cy.get('input[value="dateofbirth"]').should('exist')
    cy.get('input[value="age"]').should('exist')
    cy.get('input[value="donotknow"]').should('exist')
    cy.get('#addressline1').should('exist')
    cy.get('#addressline2').should('exist')
    cy.get('#townorcity').should('exist')
    cy.get('#postcode').should('exist')
    cy.get('#country').should('exist')
    cy.get('#relationship').should('exist')
    cy.get('#telephone1').should('exist')
    cy.get('#telephone2').should('exist')
  })

  it('should display date of birth inputs when selected', () => {
    cy.get('input[value="dateofbirth"]').check({ force: true })
    cy.get('#dob-day').should('exist')
    cy.get('#dob-month').should('exist')
    cy.get('#dob-year').should('exist')
    cy.get('.govuk-hint').should('contain', 'For example, 7/10/2002')
  })

  it('should display age input when selected', () => {
    cy.get('input[value="age"]').check({ force: true })
    cy.get('#age').should('exist')
  })

  it('should display the country dropdown', () => {
    cy.get('#country').should('be.visible')
  })

  it('should display the relationship dropdown', () => {
    cy.get('#relationship').should('be.visible')
  })
})
