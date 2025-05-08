import {
  AddEmergencyPinPhoneCreditDetails,
  SwapVOsForPinCreditDetails,
  SupplyListOfPinPhoneContactsDetails,
  ApplicationType,
} from 'express-session'

type AppTypeData = {
  details: string
  amount: string
  reason: string
} | null

// eslint-disable-next-line import/prefer-default-export
export function getAppTypeLogDetailsData(applicationType: ApplicationType, additionalData: unknown): AppTypeData {
  let details = ''
  let amount = ''
  let reason = ''

  switch (applicationType.apiValue) {
    case 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS': {
      const data = additionalData as SwapVOsForPinCreditDetails
      details = data.details || ''
      break
    }
    case 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP': {
      const data = additionalData as AddEmergencyPinPhoneCreditDetails
      amount = data.amount || ''
      reason = data.reason || ''
      break
    }

    case 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS': {
      const data = additionalData as SupplyListOfPinPhoneContactsDetails
      details = data.details || ''
      break
    }

    default:
      return null
  }

  return { details, amount, reason }
}
