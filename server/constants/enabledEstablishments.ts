export const LOG_METHOD_ENABLED_ESTABLISHMENTS: ReadonlyArray<string> = ['HMI', 'LEI', 'LNI']

export const isLogMethodEnabledEstablishment = (activeCaseLoadId?: string): boolean =>
  Boolean(activeCaseLoadId && LOG_METHOD_ENABLED_ESTABLISHMENTS.includes(activeCaseLoadId))
