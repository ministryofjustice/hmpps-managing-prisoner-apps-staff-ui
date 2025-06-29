import { AppTypeData } from './getAppTypeLogDetails'
import { getFormattedRelationshipDropdown } from './formatRelationshipList'
import { getFormattedCountries } from './formatCountryList'
import { countries } from '../constants/countries'
import PersonalRelationshipsService from '../services/personalRelationshipsService'
import logger from '../../logger'

// eslint-disable-next-line import/prefer-default-export
export async function getApplicationDetails(
  data: AppTypeData,
  services?: {
    personalRelationshipsService?: PersonalRelationshipsService
  },
): Promise<Record<string, unknown>> {
  switch (data?.type) {
    case 'PIN_PHONE_ADD_NEW_CONTACT': {
      const personalRelationshipsService = services?.personalRelationshipsService
      if (!personalRelationshipsService) {
        logger.error('PersonalRelationshipsService is required for PIN_PHONE_ADD_NEW_CONTACT')
        return {}
      }

      const formattedRelationshipList = await getFormattedRelationshipDropdown(
        personalRelationshipsService,
        data.relationship,
      )
      const formattedCountryList = getFormattedCountries(countries, data.country)

      return {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirthOrAge: data.dateOfBirthOrAge,
        dob: data.dob,
        age: data.age,
        relationship: data.relationship,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        townOrCity: data.townOrCity,
        postcode: data.postcode,
        countries: formattedCountryList,
        telephone1: data.telephone1,
        telephone2: data.telephone2,
        formattedRelationshipList,
      }
    }

    case 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP':
      return {
        amount: data.amount,
        reason: data.reason,
      }

    case 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS':
    case 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS':
      return {
        details: data.details,
      }

    default:
      return {}
  }
}
