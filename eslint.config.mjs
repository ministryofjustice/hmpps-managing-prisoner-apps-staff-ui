import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default hmppsConfig({
  extraIgnorePaths: ['integration_tests/Cypress (deprecated)/**', 'integration_tests/playwright_tests/reports/**'],
})
