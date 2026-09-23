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

export const isLogNewApplicationDisabledEstablishment = (activeCaseLoadId?: string): boolean =>
  Boolean(activeCaseLoadId && LOG_NEW_APPLICATION_DISABLED_ESTABLISHMENTS.includes(activeCaseLoadId))

export const CHANGE_APP_DETAILS_DISABLED_ESTABLISHMENTS: ReadonlyArray<string> = ['RNI']

export const isChangeAppDetailsDisabledEstablishment = (activeCaseLoadId?: string): boolean =>
  Boolean(activeCaseLoadId && CHANGE_APP_DETAILS_DISABLED_ESTABLISHMENTS.includes(activeCaseLoadId))
