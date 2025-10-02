export enum APPLICATION_TYPE_VALUES {
  PIN_PHONE_ADD_NEW_SOCIAL_CONTACT = 'add-social-pin-phone-contact',
  PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT = 'add-official-pin-phone-contact',
  PIN_PHONE_EMERGENCY_CREDIT_TOP_UP = 'add-emergency-pin-phone-credit',
  PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS = 'swap-visiting-orders-for-pin-credit',
  PIN_PHONE_SUPPLY_LIST_OF_CONTACTS = 'supply-list-of-pin-phone-contacts',
  PIN_PHONE_REMOVE_CONTACT = 'remove-pin-phone-contact',
}

export const applicationTypeLabels: Record<keyof typeof APPLICATION_TYPE_VALUES, string> = {
  PIN_PHONE_ADD_NEW_SOCIAL_CONTACT: 'Add new social PIN phone contact',
  PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT: 'Add new official PIN phone contact',
  PIN_PHONE_EMERGENCY_CREDIT_TOP_UP: 'Add emergency PIN phone credit',
  PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: 'Swap visiting orders (VOs) for PIN credit',
  PIN_PHONE_SUPPLY_LIST_OF_CONTACTS: 'Supply list of PIN phone contacts',
  PIN_PHONE_REMOVE_CONTACT: 'Remove PIN phone contact',
}
