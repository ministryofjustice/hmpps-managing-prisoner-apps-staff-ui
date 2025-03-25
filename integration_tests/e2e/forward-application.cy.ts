import TestData from '../../server/routes/testutils/testData'
import ForwardApplicationPage from '../pages/forwardApplication/swapVisitingOrdersForPinCredit'
import Page from '../pages/page'

context('Forward Application Page', () => {
  let page: ForwardApplicationPage
  const { prisonerApp: application } = new TestData()
  const {
    id: applicationId,
    requestedBy: { username: prisonerId },
  } = application

  const visitPage = () => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerApp', { prisonerId, applicationId, application })
    cy.signIn()
    cy.visit(`/applications/${prisonerId}/${applicationId}/forward`)
    page = Page.verifyOnPage(ForwardApplicationPage)
  }

  beforeEach(visitPage)

  describe('Page structure', () => {
    it('should display the correct page title', () => {
      page.pageTitle().should('include', "Forward this application to swap VO's")
    })

    it('should display all form elements', () => {
      page.forwardToDepartment().should('exist')
      page.forwardingReason().should('exist')
      page.continueButton().should('exist').and('contain.text', 'Continue')
    })
  })

  describe('Form interactions', () => {
    it('should allow submitting the form when a department is selected', () => {
      page.selectForwardToDepartment('activities')
      page.continueButton().click()
      cy.url().should('not.include', '/forward')
    })

    it('should allow adding a forwarding reason', () => {
      const reason = 'This application needs to be reviewed by Activities department.'
      page.forwardingReason().type(reason).should('have.value', reason)
    })
  })
})
