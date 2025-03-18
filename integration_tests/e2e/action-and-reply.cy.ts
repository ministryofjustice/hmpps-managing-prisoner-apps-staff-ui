import TestData from '../../server/routes/testutils/testData'
import ActionAndReplyPage from '../pages/actionAndReply'
import Page from '../pages/page'

context('Action and Reply Page', () => {
  let page: ActionAndReplyPage
  const testData = new TestData()

  const testCases = [
    { status: 'pending', label: 'pending', isClosed: false },
    { status: 'closed', label: 'closed', isClosed: true },
  ]

  testCases.forEach(({ status, label, isClosed }) => {
    describe(`When application is ${label}`, () => {
      const application = { ...testData.prisonerApp, status }
      const {
        id: applicationId,
        requestedBy: { username: prisonerId },
      } = application

      const visitPage = () => {
        cy.task('reset')
        cy.task('stubSignIn')
        cy.task('stubGetPrisonerApp', { prisonerId, applicationId, application })
        cy.signIn()
        cy.visit(`/applications/business-hub/${prisonerId}/${applicationId}/reply`)
        page = Page.verifyOnPage(ActionAndReplyPage)
      }

      beforeEach(visitPage)

      it('should display the correct page title', () => {
        page.pageTitle().should('include', 'Action and reply')
      })

      if (!isClosed) {
        describe('Pending application view', () => {
          it('should display all form elements', () => {
            cy.get('.govuk-radios').should('exist')
            cy.get('#action-and-reply-reason').should('exist')
            cy.get('button.govuk-button--primary').should('exist').and('contain.text', 'Reply')
          })
        })
      } else {
        describe('Closed application view', () => {
          it('should display the summary list with action details', () => {
            cy.get('.govuk-summary-list').should('exist')
            cy.get('.govuk-summary-list__key').contains('Action')
            cy.get('.govuk-summary-list__value').should('exist')

            cy.get('.govuk-summary-list__key').contains('Reason')
            cy.get('.govuk-summary-list__value').should('exist')

            cy.get('.govuk-summary-list__key').contains('Actioned by')
            cy.get('.govuk-summary-list__value').should('exist')

            cy.get('.govuk-summary-list__key').contains('Date')
            cy.get('.govuk-summary-list__value').should('exist')
          })

          it('should display the Print reply button', () => {
            cy.get('button.govuk-button--primary').should('exist').and('contain.text', 'Print reply')
          })
        })
      }
    })
  })
})
