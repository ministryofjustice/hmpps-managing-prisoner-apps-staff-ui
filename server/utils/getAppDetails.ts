import { Application } from '../@types/managingAppsApi'
import { countries } from '../constants/countries'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'
import PersonalRelationshipsService from '../services/personalRelationshipsService'
import { getCountryNameByCode, getFormattedCountries } from './formatCountryList'
import { AppTypeData } from './getAppTypeLogDetails'
import getFormattedRelationshipDropdown from './getFormattedRelationshipDropdown'

type AddNewSocialContactRequest = Partial<Extract<AppTypeData, { type: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT' }>>
type AddNewLegalContactRequest = Partial<Extract<AppTypeData, { type: 'PIN_PHONE_ADD_NEW_LEGAL_CONTACT' }>>

// eslint-disable-next-line import/prefer-default-export
export async function getApplicationDetails(
  applicationDetails: AppTypeData,
  personalRelationshipsService: PersonalRelationshipsService,
  application?: Application,
  earlyDaysCentre?: string,
): Promise<Record<string, unknown>> {
  if (!applicationDetails) return {}

  const getFallbackValue = <T, K extends keyof T>(field: K, form: T, request: T, defaultValue: T[K]): T[K] => {
    const value = form?.[field] ?? request?.[field]
    return value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')
      ? value
      : defaultValue
  }

  switch (applicationDetails.type) {
    case 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT': {
      const form = applicationDetails as AddNewSocialContactRequest
      const request = (application?.requests?.[0] as AddNewSocialContactRequest) ?? {}

      const prefilledDetails: AddNewSocialContactRequest = {
        firstName: getFallbackValue('firstName', form, request, ''),
        lastName: getFallbackValue('lastName', form, request, ''),
        dateOfBirthOrAge: getFallbackValue('dateOfBirthOrAge', form, request, undefined),
        dob: getFallbackValue('dob', form, request, undefined),
        age: getFallbackValue('age', form, request, ''),
        relationship: getFallbackValue('relationship', form, request, ''),
        addressLine1: getFallbackValue('addressLine1', form, request, ''),
        addressLine2: getFallbackValue('addressLine2', form, request, ''),
        townOrCity: getFallbackValue('townOrCity', form, request, ''),
        postcode: getFallbackValue('postcode', form, request, ''),
        country: getFallbackValue('country', form, request, ''),
        telephone1: getFallbackValue('telephone1', form, request, ''),
        telephone2: getFallbackValue('telephone2', form, request, ''),
      }

      return handleAddNewSocialContact(prefilledDetails, earlyDaysCentre, personalRelationshipsService)
    }

    case 'PIN_PHONE_ADD_NEW_LEGAL_CONTACT': {
      const form = applicationDetails as AddNewLegalContactRequest
      const request = (application?.requests?.[0] as AddNewLegalContactRequest) ?? {}

      const prefilledDetails: AddNewLegalContactRequest = {
        firstName: getFallbackValue('firstName', form, request, ''),
        lastName: getFallbackValue('lastName', form, request, ''),
        company: getFallbackValue('company', form, request, ''),
        relationship: getFallbackValue('relationship', form, request, ''),
        telephone1: getFallbackValue('telephone1', form, request, ''),
        telephone2: getFallbackValue('telephone2', form, request, ''),
      }

      return handleAddNewLegalContact(prefilledDetails, personalRelationshipsService)
    }

    case 'PIN_PHONE_EMERGENCY_CREDIT_TOP_UP': {
      const { amount, reason } = application?.requests?.[0] ?? {}
      return {
        amount: applicationDetails.amount || String(amount ?? ''),
        reason: applicationDetails.reason || reason || '',
      }
    }

    case 'PIN_PHONE_SUPPLY_LIST_OF_CONTACTS':
    case 'PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS': {
      const { details } = application?.requests?.[0] ?? {}
      return {
        details: applicationDetails.details || details || '',
      }
    }

    default:
      return {}
  }
}

async function handleAddNewSocialContact(
  details: AddNewSocialContactRequest,
  earlyDaysCentre: string,
  personalRelationshipsService: PersonalRelationshipsService,
): Promise<Record<string, unknown>> {
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
  } = details

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
    formattedRelationshipList: await getFormattedRelationshipDropdown(personalRelationshipsService, relationship),
    earlyDaysCentre,
  }
}

async function handleAddNewLegalContact(
  details: AddNewLegalContactRequest,
  personalRelationshipsService: PersonalRelationshipsService,
): Promise<Record<string, unknown>> {
  const { firstName, lastName, company, relationship, telephone1, telephone2 } = details

  return {
    firstName,
    lastName,
    company,
    relationship,
    telephone1,
    telephone2,
    formattedRelationshipList: await getFormattedRelationshipDropdown(
      personalRelationshipsService,
      relationship,
      PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP,
    ),
  }
}
