import { APPLICATION_TYPE_VALUES, applicationTypeLabels } from '../constants/applicationTypes'

export const appTypes = {
  addNewSocialContact: {
    id: 1,
    name: 'Add new social PIN phone contact',
    genericType: false,
    logDetailRequired: false,
  },
  addNewOfficialContact: {
    id: 2,
    name: 'Add new official PIN phone contact',
    genericType: false,
    logDetailRequired: false,
  },
  removeContact: {
    id: 3,
    name: 'Remove PIN phone contact',
    genericType: false,
    logDetailRequired: false,
  },
  addGenericContact: {
    id: 4,
    name: 'Add generic contact request',
    genericType: true,
    logDetailRequired: true,
  },
  emergencyCredit: {
    id: 5,
    name: 'Add emergency PIN phone credit',
    genericType: false,
    logDetailRequired: false,
  },
  swapVOs: {
    id: 6,
    name: 'Swap visiting orders (VOs) for PIN credit',
    genericType: false,
    logDetailRequired: false,
  },
  genericCreditVisit: {
    id: 7,
    name: 'Generic credit and Visit',
    genericType: true,
    logDetailRequired: false,
  },
}

export const legacyAppTypes = [
  {
    key: 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP,
    name: applicationTypeLabels.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP,
  },
  {
    key: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_ADD_NEW_SOCIAL_CONTACT,
    name: applicationTypeLabels.PIN_PHONE_ADD_NEW_SOCIAL_CONTACT,
  },
  {
    key: 'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT,
    name: applicationTypeLabels.PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT,
  },
  {
    key: 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS,
    name: applicationTypeLabels.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS,
  },
  {
    key: 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_SUPPLY_LIST_OF_CONTACTS,
    name: applicationTypeLabels.PIN_PHONE_SUPPLY_LIST_OF_CONTACTS,
  },
  {
    key: 'PIN_PHONE_REMOVE_CONTACT',
    value: APPLICATION_TYPE_VALUES.PIN_PHONE_REMOVE_CONTACT,
    name: applicationTypeLabels.PIN_PHONE_REMOVE_CONTACT,
  },
]
