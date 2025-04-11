import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import Page from '../pages/page'

context('Application Details Page - – Swap visiting orders (VOs) for PIN credit', () => {
  let page: ApplicationDetailsPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/log/application-details')

    cy.contains('Swap visiting orders (VOs) for PIN credit').click()
    cy.contains('button', 'Continue').click()
    cy.contains('Prison number').should('exist')
    cy.get('#prison-number').type('G9812CC')
    cy.contains('Date').should('exist')
    cy.get('#date').type('10/04/2023')
    cy.contains('button', 'Continue').click()
    page = Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Log details')
  })

  it('should render the page heading correctly', () => {
    page.checkOnPage()
  })

  it('should render the back link with correct text and href', () => {
    page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/log/prisoner-details')
  })

  it('should render the correct app type title', () => {
    page.appTypeTitle().should('have.text', 'Swap visiting orders (VOs) for PIN credit')
  })

  it('should render the correct form label for the textarea', () => {
    page.swapVosFormLabel().should('contain.text', 'Details (optional)')
  })

  it('should display the hint text correctly', () => {
    page
      .swapVosHintText()
      .should('contain.text', 'Add a brief summary, for example, if this person is a Foreign National')
  })

  it('should contain a textarea with the correct ID', () => {
    page.swapVosTextArea().should('have.attr', 'id', 'swap-vos-pin-credit-details')
  })

  it('should include a hidden CSRF token input field', () => {
    page.csrfToken().should('exist')
  })

  it('should render a Continue button with the correct text', () => {
    page.continueButton().should('contain.text', 'Continue')
  })
})

context('Application Details Page - – Add emergency PIN phone credit', () => {
  let page: ApplicationDetailsPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/log/application-details')

    cy.contains('Add emergency PIN phone credit').click()
    cy.contains('button', 'Continue').click()
    cy.contains('Prison number').should('exist')
    cy.get('#prison-number').type('G9812CC')
    cy.contains('Date').should('exist')
    cy.get('#date').type('10/04/2023')
    cy.contains('button', 'Continue').click()
    page = Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should render correct app type title for Add emergency PIN phone credit', () => {
    page.appTypeTitle().should('have.text', 'Add emergency PIN phone credit')
  })

  it('should display the amount hint text correctly', () => {
    page.emergencyPinCreditAmountHintText().should('contain.text', 'Use only multiplies of £1, with a limit of £5')
  })

  it('should render the correct form label for the textarea', () => {
    page.emergencyPinCreditFormLabel().should('contain.text', 'Reason')
  })

  it('should display the hint text area correctly', () => {
    page.emergencyPinCreditHintTextArea().should('contain.text', 'Add a brief summary')
  })

  it('should contain a textarea with the correct ID', () => {
    page.emergencyPinCreditTextArea().should('have.attr', 'id', 'add-emergency-pin-phone-credit-details')
  })
})
