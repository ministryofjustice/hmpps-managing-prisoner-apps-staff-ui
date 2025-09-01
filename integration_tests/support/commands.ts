Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('resetAndSignIn', () => {
  cy.task('reset')
  cy.task('stubSignIn')
  cy.signIn()
})

Cypress.Commands.add('visitIndexAndStartApplication', () => {
  cy.visit('/')
  cy.contains('a', 'Log a new application').click()
  cy.task('stubGetAppTypes')
})

Cypress.Commands.add('enterPrisonerDetails', () => {
  cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
  cy.get('#prison-number').type('A1234AA')
  cy.contains('button', 'Find prisoner').click()
  cy.contains('button', 'Continue').click()
})

Cypress.Commands.add('selectApplicationType', (appType: string) => {
  cy.contains(appType).click()
  cy.contains('button', 'Continue').click()
})
