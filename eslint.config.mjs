import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default hmppsConfig({
  extraIgnorePaths: ['integration_tests/Cypress (deprecated)/**'],
  extraPathsAllowingDevDependencies: ['.allowed-scripts.mjs'],
})
