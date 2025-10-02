import { Application } from '../@types/managingAppsApi'
import { countries } from '../constants/countries'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'
import PersonalRelationshipsService from '../services/personalRelationshipsService'
import { getCountryNameByCode, getFormattedCountries } from './formatCountryList'
import { AppTypeData } from './getAppTypeLogDetails'
import getFormattedRelationshipDropdown from './getFormattedRelationshipDropdown'

type AddNewSocialContactRequest = Partial<Extract<AppTypeData, { type: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT' }>>
type AddNewOfficialContactRequest = Partial<Extract<AppTypeData, { type: 'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT' }>>
type RemoveContactRequest = Partial<Extract<AppTypeData, { type: 'PIN_PHONE_REMOVE_CONTACT' }>>

export default async function getApplicationDetails(
  applicationDetails: AppTypeData,
  personalRelationshipsService: PersonalRelationshipsService,
  application?: Application,
  earlyDaysCentre?: string,
): Promise<Record<string, unknown>> {
  if (!applicationDetails) return {}

  const isValid = (value: unknown): boolean =>
    value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')

  const getFallbackValue = <FormType, RequestType, K extends keyof FormType & keyof RequestType>(
    field: K,
    form: FormType,
    request: RequestType,
    defaultValue: FormType[K],
  ): FormType[K] | RequestType[K] => {
    const formValue = form[field]
    const requestValue = request[field]

    if (isValid(formValue)) return formValue
    if (isValid(requestValue)) return requestValue
    return defaultValue
  }

  switch (applicationDetails.type) {
    case 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT': {
      const request = (application?.requests?.[0] as AddNewSocialContactRequest) ?? {}

      const prefilledDetails: AddNewSocialContactRequest = {
        firstName: getFallbackValue('firstName', applicationDetails, request, ''),
        lastName: getFallbackValue('lastName', applicationDetails, request, ''),
        dateOfBirthOrAge: getFallbackValue('dateOfBirthOrAge', applicationDetails, request, undefined),
        dob: getFallbackValue('dob', applicationDetails, request, undefined),
        age: getFallbackValue('age', applicationDetails, request, ''),
        relationship: getFallbackValue('relationship', applicationDetails, request, ''),
        addressLine1: getFallbackValue('addressLine1', applicationDetails, request, ''),
        addressLine2: getFallbackValue('addressLine2', applicationDetails, request, ''),
        townOrCity: getFallbackValue('townOrCity', applicationDetails, request, ''),
        postcode: getFallbackValue('postcode', applicationDetails, request, ''),
        country: getFallbackValue('country', applicationDetails, request, ''),
        telephone1: getFallbackValue('telephone1', applicationDetails, request, ''),
        telephone2: getFallbackValue('telephone2', applicationDetails, request, ''),
      }

      return handleAddNewSocialContact(prefilledDetails, earlyDaysCentre, personalRelationshipsService)
    }

    case 'PIN_PHONE_ADD_NEW_OFFICIAL_CONTACT': {
      const request = (application?.requests?.[0] as AddNewOfficialContactRequest) ?? {}

      const prefilledDetails: AddNewOfficialContactRequest = {
        firstName: getFallbackValue('firstName', applicationDetails, request, ''),
        lastName: getFallbackValue('lastName', applicationDetails, request, ''),
        company: getFallbackValue('company', applicationDetails, request, ''),
        relationship: getFallbackValue('relationship', applicationDetails, request, ''),
        telephone1: getFallbackValue('telephone1', applicationDetails, request, ''),
        telephone2: getFallbackValue('telephone2', applicationDetails, request, ''),
      }

      return handleAddNewOfficialContact(prefilledDetails, personalRelationshipsService)
    }

    case 'PIN_PHONE_REMOVE_CONTACT': {
      const request = (application?.requests?.[0] as RemoveContactRequest) ?? {}

      const prefilledDetails = {
        firstName: getFallbackValue('firstName', applicationDetails, request, ''),
        lastName: getFallbackValue('lastName', applicationDetails, request, ''),
        telephone1: getFallbackValue('telephone1', applicationDetails, request, ''),
        telephone2: getFallbackValue('telephone2', applicationDetails, request, ''),
        relationship: getFallbackValue('relationship', applicationDetails, request, ''),
      }

      return prefilledDetails
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
    formattedRelationshipList: await getFormattedRelationshipDropdown(
      personalRelationshipsService,
      relationship,
      PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP,
    ),
    earlyDaysCentre,
  }
}

async function handleAddNewOfficialContact(
  details: AddNewOfficialContactRequest,
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
