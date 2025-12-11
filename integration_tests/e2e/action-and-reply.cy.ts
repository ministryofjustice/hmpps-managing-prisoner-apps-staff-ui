import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import { app, appTypes } from '../../server/testData'
import ActionAndReplyPage from '../pages/actionAndReply'
import Page from '../pages/page'

context('Action and Reply Page', () => {
  const testCases = [
    { status: APPLICATION_STATUS.PENDING, label: 'pending', isClosed: false },
    { status: APPLICATION_STATUS.APPROVED, label: 'closed', isClosed: true },
  ]

  Object.values(appTypes).forEach(({ id, name }) => {
    testCases.forEach(({ status, label, isClosed }) => {
      describe(`AppType: ${id} | Status: ${label}`, () => {
        let page: ActionAndReplyPage

        beforeEach(() => {
          const application = { ...app, status, applicationType: { id, name } }

          cy.resetAndSignIn()

          cy.task('stubGetPrisonerApp', { app: application })
          cy.task('stubGetAppResponse', { app: application })
          cy.task('stubGetGroupsAndTypes')

          cy.visit(`/applications/${application.requestedBy.username}/${application.id}/reply`)
          page = Page.verifyOnPage(ActionAndReplyPage)
        })

        it('should display the correct page title', () => {
          page.pageTitle().should('include', 'Action and reply')
        })

        it('should display the correct app type name', () => {
          cy.get('.govuk-caption-xl').should('contain.text', name)
        })

        it(`should display the correct ${isClosed ? 'summary list' : 'form elements'}`, () => {
          if (isClosed) {
            cy.get('.govuk-summary-list').should('exist')
            cy.get('.govuk-summary-list__key').contains('Action')
            cy.get('.govuk-summary-list__value').should('exist')

            cy.get('.govuk-summary-list__key').contains('Reason')
            cy.get('.govuk-summary-list__value').should('exist')

            cy.get('.govuk-summary-list__key').contains('Date')
            cy.get('.govuk-summary-list__value').should('exist')

            cy.get('.govuk-summary-list__key').contains('Location')
            cy.get('.govuk-summary-list__value').should('exist')
          } else {
            cy.get('.govuk-radios').should('exist')
            cy.get('#action-and-reply-reason').should('exist')
            cy.get('button.govuk-button--primary').should('exist').and('contain.text', 'Save')
          }
        })

        it('should trigger window print when Print reply button is clicked', function printTest() {
          if (!isClosed) {
            this.skip()
          }
          cy.contains('button', 'Print reply').should('exist')
          cy.window().then(win => {
            cy.stub(win, 'print').as('printStub')
          })
          cy.get('#print-button').click()
          cy.get('@printStub').should('have.been.calledOnce')
        })
      })
    })
  })
})
