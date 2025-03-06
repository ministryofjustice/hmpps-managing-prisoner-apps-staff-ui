import { APPLICATION_TYPES } from '../constants/applicationTypes'

// eslint-disable-next-line import/prefer-default-export
export const getApplicationType = (applicationType: string) =>
  APPLICATION_TYPES.find(type => type.apiValue === applicationType)
