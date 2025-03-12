import TestData from '../../server/routes/testutils/testData'
import ConfirmDetailsPage from '../pages/confirmDetailsPage'
import Page from '../pages/page'

context('Confirm Details Page', () => {
  let page: ConfirmDetailsPage
  const { prisonerApp: application } = new TestData()
  const {
    id: applicationId,
    requestedBy: { username: prisonerId },
  } = application

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  context('Confirm log details', () => {
    beforeEach(() => {
      cy.visit('/log/confirm')

      cy.contains('Swap visiting orders (VOs) for PIN credit').click()
      cy.contains('button', 'Continue').click()
      cy.contains('button', 'Continue').click()
      cy.contains('button', 'Continue').click()

      page = Page.verifyOnPage(ConfirmDetailsPage)
    })

    it('should display the correct page title', () => {
      page.pageTitle().should('include', 'Check details')
    })

    it('should render the back link with correct text and href', () => {
      page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/log/application-details')
    })

    it('should render the application type summary with correct text', () => {
      page.applicationType().should('contain.text', 'Swap VOs for pin credit')
    })

    it('should allow changing the application type', () => {
      page.changeApplicationType().should('exist').and('have.attr', 'href', '#')
    })

    it('should render prisoner name summary with correct text', () => {
      page.prisonerName().should('exist')
    })

    it('should allow changing the prisoner details', () => {
      page.changePrisoner().should('exist').and('have.attr', 'href', '#')
    })

    it('should display the submitted on date', () => {
      page.submittedOn().should('exist')
    })

    it('should allow changing the submission date', () => {
      page.changeSubmittedOn().should('exist').and('have.attr', 'href', '#')
    })

    it('should display the VOs to swap details', () => {
      page.swapVOsDetails().should('exist')
    })

    it('should allow changing the swap VOs details', () => {
      page.changeSwapVOsDetails().should('exist').and('have.attr', 'href', '#')
    })

    it('should render a Continue button with the correct text', () => {
      page.continueButton().should('contain.text', 'Continue')
    })
  })

  context('Confirm update details', () => {
    beforeEach(() => {
      cy.task('stubGetPrisonerApp', {
        prisonerId,
        applicationId,
        application,
      })

      cy.visit(`/applications/business-hub/${prisonerId}/${applicationId}/change/confirm`)

      page = Page.verifyOnPage(ConfirmDetailsPage)
    })

    it('should display the correct page title', () => {
      page.pageTitle().should('include', 'Check details')
    })

    it('should render the back link with correct text and href', () => {
      page
        .backLink()
        .should('have.text', 'Back')
        .and('have.attr', 'href', `/applications/business-hub/${prisonerId}/${applicationId}/change`)
    })

    it('should render the application type summary with correct text', () => {
      page.applicationType().should('contain.text', 'Swap VOs for pin credit')
    })

    it('should allow changing the application type', () => {
      page.changeApplicationType().should('not.exist')
    })

    it('should render prisoner name summary with correct text', () => {
      page.prisonerName().should('exist')
    })

    it('should allow changing the prisoner details', () => {
      page.changePrisoner().should('not.exist')
    })

    it('should display the submitted on date', () => {
      page.submittedOn().should('exist')
    })

    it('should allow changing the submission date', () => {
      page.changeSubmittedOn().should('not.exist')
    })

    it('should display the VOs to swap details', () => {
      page.swapVOsDetails().should('exist')
    })

    it('should allow changing the swap VOs details', () => {
      page.changeSwapVOsDetails().should('exist').and('have.attr', 'href', '#')
    })

    it('should render a Continue button with the correct text', () => {
      page.continueButton().should('contain.text', 'Continue')
    })
  })
})
