import { APPLICATION_STATUS } from '../../server/constants/applicationStatus'
import TestData from '../../server/routes/testutils/testData'
import ActionAndReplyPage from '../pages/actionAndReply'
import Page from '../pages/page'

const appTypes = [
  {
    appType: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
    caption: 'Swap visiting orders (VOs) for PIN credit',
  },
  {
    appType: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
    caption: 'Add emergency PIN phone credit',
  },
]

context('Action and Reply Page', () => {
  appTypes.forEach(({ appType, caption }) => {
    context(`AppType: ${appType}`, () => {
      const testCases = [
        { status: APPLICATION_STATUS.PENDING, label: 'pending', isClosed: false },
        { status: APPLICATION_STATUS.APPROVED, label: 'closed', isClosed: true },
      ]
      testCases.forEach(({ status, label, isClosed }) => {
        describe(`When application is ${label}`, () => {
          const testData = new TestData()
          const app = { ...testData.app, status, appType }

          let page: ActionAndReplyPage
          const visitPage = () => {
            cy.task('reset')
            cy.task('stubSignIn')
            cy.task('stubGetPrisonerApp', { app })
            cy.task('stubGetAppResponse', { app })
            cy.signIn()
            cy.visit(`/applications/${app.requestedBy.username}/${app.id}/reply`)
            page = Page.verifyOnPage(ActionAndReplyPage)
          }
          beforeEach(visitPage)

          it('should display the correct page title', () => {
            page.pageTitle().should('include', 'Action and reply')
          })

          it('should display the correct app type caption', () => {
            cy.get('.govuk-caption-xl').should('contain.text', caption)
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
            })
          }
        })
      })
    })
  })
})
