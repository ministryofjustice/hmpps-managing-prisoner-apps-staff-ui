import { defineConfig } from 'cypress'
import auth from './integration_tests/mockApis/auth'
import managingPrisonerAppsApi from './integration_tests/mockApis/managingPrisonerApps'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import prison from './integration_tests/mockApis/prison'
import personalRelationships from './integration_tests/mockApis/personalRelationships'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...managingPrisonerAppsApi,
        ...personalRelationships,
        ...prison,
        ...tokenVerification,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
    env: {
      LOG_METHOD_PAGE_ENABLED: process.env.LOG_METHOD_PAGE_ENABLED || 'true',
    },
  },
})
