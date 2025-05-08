export enum APPLICATION_TYPE_VALUES {
  PIN_PHONE_EMERGENCY_CREDIT_TOP_UP = 'add-emergency-pin-phone-credit',
  PIN_PHONE_SUPPLY_LIST_OF_CONTACTS = 'supply-list-of-pin-phone-contacts',
  PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS = 'swap-visiting-orders-for-pin-credit',
}

export const APPLICATION_TYPES = [
  {
    name: 'Add emergency PIN phone credit',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP,
    apiValue: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
  },
  {
    name: 'Supply list of PIN phone contacts',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_SUPPLY_LIST_OF_CONTACTS,
    apiValue: 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
  },
  {
    name: 'Swap visiting orders (VOs) for PIN credit',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS,
    apiValue: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
  },
]
