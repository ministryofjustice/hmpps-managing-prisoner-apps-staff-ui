import { add } from 'date-fns'
import { APPLICATION_TYPE_VALUES, applicationTypeLabels } from '../constants/applicationTypes'

export const appTypes = {
  emergencyCredit: {
    id: 1,
    name: 'Add emergency phone credit',
    genericType: false,
    logDetailRequired: false,
  },
  addNewOfficialContact: {
    id: 2,
    name: 'Add an official PIN phone contact',
    genericType: false,
    logDetailRequired: false,
  },
  addNewSocialContact: {
    id: 3,
    name: 'Add a social PIN phone contact',
    genericType: false,
    logDetailRequired: false,
  },
  addOrRemoveContact: {
    id: 4,
    name: 'Add or remove a PIN phone contact',
    genericType: false,
    logDetailRequired: false,
  },
  swapVOs: {
    id: 5,
    name: 'Swap Visiting Orders (VOs) for PIN Credit',
    genericType: false,
    logDetailRequired: false,
  },
  makeGeneralEnquiry: {
    id: 6,
    name: 'Make a general PIN phone enquiry',
    genericType: true,
    logDetailRequired: true,
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
