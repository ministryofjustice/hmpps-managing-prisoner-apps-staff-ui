declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to sign in. Set failOnStatusCode to false if you expect a non-200 return code.
     * @example cy.signIn({ failOnStatusCode: false })
     */
    signIn(options?: { failOnStatusCode: boolean }): Chainable<AUTWindow>

    /**
     * Resets the test state and signs in.
     * @example cy.resetAndSignIn()
     */
    resetAndSignIn(): Chainable<void>

    /**
     * Enters prisoner details and continues.
     * @example cy.enterPrisonerDetails()
     */
    enterPrisonerDetails(): Chainable<void>

    /**
     * Selects a group and continues.
     * @example cy.selectGroup('Pin phone apps')
     */
    selectGroup(group: string): Chainable<void>

    /**
     * Selects an application type and continues.
     * @example cy.selectApplicationType('Add new social PIN phone contact')
     */
    selectApplicationType(appType: string): Chainable<void>

    /**
     * Selects a department by name and continues.
     * @example cy.selectDepartment('Business Hub')
     */
    selectDepartment(departmentName: string): Chainable<void>

    /**
     * Selects a logging method and continues.
     * @example cy.selectLoggingMethod('manual')
     */
    selectLoggingMethod(method: 'manual' | 'webcam'): Chainable<void>
  }
}
