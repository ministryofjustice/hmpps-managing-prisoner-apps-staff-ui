Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('resetAndSignIn', () => {
  cy.task('reset')
  cy.task('stubSignIn')
  cy.signIn()
})

Cypress.Commands.add('enterPrisonerDetails', () => {
  cy.get('#prison-number').type('A1234AA')
  cy.contains('button', 'Find prisoner').click()
  cy.contains('button', 'Continue').click()
})

Cypress.Commands.add('selectApplicationType', (appType: string) => {
  cy.contains(appType).click()
  cy.contains('button', 'Continue').click()
})

Cypress.Commands.add('selectDepartment', (departmentName: string) => {
  cy.contains(departmentName).click()
  cy.contains('button', 'Continue').click()
})
