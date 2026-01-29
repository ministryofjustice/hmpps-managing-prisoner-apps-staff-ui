import Page from './page'

export default class PhotoCapturePage extends Page {
  constructor() {
    super('Take a photo of the application')
  }

  pageTitle() {
    return cy.title()
  }

  backLink() {
    return cy.get('.govuk-back-link')
  }

  csrfToken() {
    return cy.get('input[name="_csrf"]')
  }

  takePhotoButton() {
    return cy.contains('button', 'Take photo')
  }

  saveAndContinueButton() {
    return cy.contains('button', 'Save and continue')
  }

  instructions() {
    return cy.get('.govuk-list--bullet')
  }
}
