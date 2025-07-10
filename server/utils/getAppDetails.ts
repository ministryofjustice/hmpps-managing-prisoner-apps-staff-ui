import { AppTypeData } from './getAppTypeLogDetails'
import { getFormattedRelationshipDropdown } from './formatRelationshipList'
import { getFormattedCountries, getCountryNameByCode } from './formatCountryList'
import { countries } from '../constants/countries'
import PersonalRelationshipsService from '../services/personalRelationshipsService'
import logger from '../../logger'
import { Application } from '../@types/managingAppsApi'

type Services = {
  personalRelationshipsService?: PersonalRelationshipsService
}

type RequestSummary = Partial<{
  amount: number
  reason: string
  details: string
}>

// eslint-disable-next-line import/prefer-default-export
export async function getApplicationDetails(
  applicationDetails: AppTypeData,
  services?: Services,
  application?: Application,
): Promise<Record<string, unknown>> {
  if (!applicationDetails) return {}

  const { amount, reason, details }: RequestSummary = application?.requests?.[0] ?? {}

  switch (applicationDetails.type) {
    case 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT':
      return handleAddNewContact(applicationDetails, services?.personalRelationshipsService)

    case 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP':
      return {
        amount: applicationDetails.amount || String(amount ?? ''),
        reason: applicationDetails.reason || reason || '',
      }

    case 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS':
    case 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS':
      return {
        details: applicationDetails.details || details || '',
      }

    default:
      return {}
  }
}

async function handleAddNewContact(
  applicationDetails: Extract<AppTypeData, { type: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT' }>,
  personalRelationshipsService?: PersonalRelationshipsService,
): Promise<Record<string, unknown>> {
  if (!personalRelationshipsService) {
    logger.error('PersonalRelationshipsService is required for PIN_PHONE_ADD_NEW_SOCIAL_CONTACT')
    return {}
  }

  const {
    firstName,
    lastName,
    dateOfBirthOrAge,
    dob,
    age,
    relationship,
    addressLine1,
    addressLine2,
    townOrCity,
    postcode,
    country,
    telephone1,
    telephone2,
  } = applicationDetails

  const formattedRelationshipList = await getFormattedRelationshipDropdown(personalRelationshipsService, relationship)

  return {
    firstName,
    lastName,
    dateOfBirthOrAge,
    dob,
    age,
    relationship,
    addressLine1,
    addressLine2,
    townOrCity,
    postcode,
    countries: getFormattedCountries(countries, country),
    country: getCountryNameByCode(country),
    telephone1,
    telephone2,
    formattedRelationshipList,
  }
}
