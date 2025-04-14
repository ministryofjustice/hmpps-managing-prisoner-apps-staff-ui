export enum APPLICATION_TYPE_VALUES {
  PIN_PHONE_EMERGENCY_CREDIT_TOP_UP = 'add-emergency-pin-phone-credit',
  PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS = 'swap-visiting-orders-for-pin-credit',
}

export const APPLICATION_TYPES = [
  {
    name: 'Add emergency PIN phone credit',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP,
    apiValue: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
  },
  {
    name: 'Swap visiting orders (VOs) for PIN credit',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS,
    apiValue: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
  },
]
