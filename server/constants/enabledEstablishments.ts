export const LOG_METHOD_ENABLED_ESTABLISHMENTS: ReadonlyArray<string> = [
  'HMI',
  'LEI',
  'LNI',
  'MDI',
  'HHI',
  'HLI',
  'WEI',
]

export const isLogMethodEnabledEstablishment = (activeCaseLoadId?: string): boolean =>
  Boolean(activeCaseLoadId && LOG_METHOD_ENABLED_ESTABLISHMENTS.includes(activeCaseLoadId))

export const LOG_NEW_APPLICATION_DISABLED_ESTABLISHMENTS: ReadonlyArray<string> = ['RNI']

export const isLogNewApplicationEnabledEstablishment = (activeCaseLoadId?: string): boolean =>
  !activeCaseLoadId || !LOG_NEW_APPLICATION_DISABLED_ESTABLISHMENTS.includes(activeCaseLoadId)
