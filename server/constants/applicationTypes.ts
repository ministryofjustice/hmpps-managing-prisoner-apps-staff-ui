export type ApplicationType = {
  name: string
  value: string
  apiValue: string
}

export enum APPLICATION_TYPE_VALUES {
  PIN_PHONE_SOCIAL_CONTACT = 'add-social-pin-phone-contact',
  PIN_PHONE_EMERGENCY_CREDIT_TOP_UP = 'add-emergency-pin-phone-credit',
  PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS = 'swap-visiting-orders-for-pin-credit',
  PIN_PHONE_SUPPLY_LIST_OF_CONTACTS = 'supply-list-of-pin-phone-contacts',
}

export const applicationTypeLabels: Record<keyof typeof APPLICATION_TYPE_VALUES, string> = {
  PIN_PHONE_SOCIAL_CONTACT: 'Add new social PIN phone contact',
  PIN_PHONE_EMERGENCY_CREDIT_TOP_UP: 'Add emergency PIN phone credit',
  PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: 'Swap visiting orders (VOs) for PIN credit',
  PIN_PHONE_SUPPLY_LIST_OF_CONTACTS: 'Supply list of PIN phone contacts',
}

export const APPLICATION_TYPES = Object.entries(APPLICATION_TYPE_VALUES).map(([key, value]) => ({
  name: applicationTypeLabels[key as keyof typeof APPLICATION_TYPE_VALUES],
  value,
  apiValue: key,
}))
