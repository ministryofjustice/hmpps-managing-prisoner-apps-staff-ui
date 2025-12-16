import { Request, Response } from 'express'
import { ApplicationType } from '../@types/managingAppsApi'
import * as validateAmountField from '../routes/validate/validateAmountField'
import * as validateNewOfficialContact from '../routes/validate/validateNewOfficialContact'
import * as validateNewSocialContact from '../routes/validate/validateNewSocialPinPhoneContact'
import * as validateRemovePinPhoneContact from '../routes/validate/validateRemovePinPhoneContact'
import * as validateTextField from '../routes/validate/validateTextField'
import * as countries from './data/countries'
import { handleApplicationDetails } from './handleAppDetails'
import * as session from './http/session'

jest.mock('../routes/validate/validateAmountField')
jest.mock('../routes/validate/validateNewOfficialContact')
jest.mock('../routes/validate/validateNewSocialPinPhoneContact')
jest.mock('../routes/validate/validateRemovePinPhoneContact')
jest.mock('../routes/validate/validateTextField')
jest.mock('./data/countries')
jest.mock('./http/session')

describe(handleApplicationDetails.name, () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockGetAppType: jest.Mock
  let mockGetTemplateData: jest.Mock
  let mockSuccessRedirect: jest.Mock

  const baseApplicationType: ApplicationType = {
    id: 1,
    name: 'Test Application',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockReq = {
      body: {},
    }

    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
    }

    mockGetAppType = jest.fn().mockReturnValue(baseApplicationType)
    mockGetTemplateData = jest.fn().mockResolvedValue({})
    mockSuccessRedirect = jest.fn().mockReturnValue('/success')
  })

  const getOptions = (overrides = {}) => ({
    getAppType: mockGetAppType,
    getTemplateData: mockGetTemplateData,
    isUpdate: false,
    renderPath: 'test/template',
    successRedirect: mockSuccessRedirect,
    ...overrides,
  })

  describe('generic applications', () => {
    beforeEach(() => {
      mockGetAppType.mockReturnValue({
        ...baseApplicationType,
        genericType: true,
      })
    })

    it('validates and saves details for generic type applications', async () => {
      mockReq.body = { details: 'Test details' }
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(validateTextField.validateTextField).toHaveBeenCalledWith({
        fieldValue: 'Test details',
        fieldName: 'Details',
        isRequired: true,
      })
      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: { details: 'Test details' },
      })
      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
    })

    it('renders form with errors when validation fails', async () => {
      mockReq.body = { details: '' }
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({
        Details: 'Details is required',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        details: '',
        errors: { Details: 'Details is required' },
      })
      expect(mockRes.redirect).not.toHaveBeenCalled()
    })

    it('handles generic form applications', async () => {
      mockGetAppType.mockReturnValue({
        ...baseApplicationType,
        genericForm: true,
      })
      mockReq.body = { details: 'Generic form details' }
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: { details: 'Generic form details' },
      })
      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
    })
  })

  describe('application type 1 - Emergency Credit', () => {
    beforeEach(() => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, id: 1 })
    })

    it('validates and saves amount and reason successfully', async () => {
      mockReq.body = { amount: '10.50', reason: 'Emergency call' }
      ;(validateAmountField.validateAmountField as jest.Mock).mockReturnValue({
        errors: {},
        value: '10.50',
      })
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(validateAmountField.validateAmountField).toHaveBeenCalledWith('10.50', 'Amount', true)
      expect(validateTextField.validateTextField).toHaveBeenCalledWith({
        fieldValue: 'Emergency call',
        fieldName: 'Reason',
        isRequired: true,
      })
      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: { amount: '10.50', reason: 'Emergency call' },
      })
      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
    })

    it('renders form with amount errors', async () => {
      mockReq.body = { amount: 'invalid', reason: 'Emergency call' }
      ;(validateAmountField.validateAmountField as jest.Mock).mockReturnValue({
        errors: { Amount: 'Amount must be a valid number' },
        value: null,
      })
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        amount: 'invalid',
        reason: 'Emergency call',
        errors: { Amount: 'Amount must be a valid number' },
      })
      expect(mockRes.redirect).not.toHaveBeenCalled()
    })

    it('renders form with reason errors', async () => {
      mockReq.body = { amount: '10.50', reason: '' }
      ;(validateAmountField.validateAmountField as jest.Mock).mockReturnValue({
        errors: {},
        value: '10.50',
      })
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({
        Reason: 'Reason is required',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        amount: '10.50',
        reason: '',
        errors: { Reason: 'Reason is required' },
      })
    })

    it('renders form with both amount and reason errors', async () => {
      mockReq.body = { amount: 'invalid', reason: '' }
      ;(validateAmountField.validateAmountField as jest.Mock).mockReturnValue({
        errors: { Amount: 'Amount must be a valid number' },
        value: null,
      })
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({
        Reason: 'Reason is required',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        amount: 'invalid',
        reason: '',
        errors: {
          Amount: 'Amount must be a valid number',
          Reason: 'Reason is required',
        },
      })
    })
  })

  describe('application type 2 - Add Official Contact', () => {
    beforeEach(() => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, id: 2 })
      mockGetTemplateData.mockResolvedValue({
        formattedRelationshipList: [
          { value: '', text: 'Select relationship' },
          { value: 'Solicitor', text: 'Solicitor' },
          { value: 'Doctor', text: 'Doctor' },
        ],
      })
    })

    it('validates and saves official contact successfully', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Smith',
        organisation: 'Legal Aid',
        relationship: 'Solicitor',
        telephone1: '01234567890',
        telephone2: '07890123456',
      }
      ;(validateNewOfficialContact.validateAddNewOfficialContact as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(validateNewOfficialContact.validateAddNewOfficialContact).toHaveBeenCalledWith(mockReq.body)
      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: {
          firstName: 'John',
          lastName: 'Smith',
          organisation: 'Legal Aid',
          relationship: 'Solicitor',
          telephone1: '01234567890',
          telephone2: '07890123456',
        },
      })
      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
    })

    it('renders form with errors and updates selected relationship', async () => {
      mockReq.body = {
        firstName: '',
        lastName: 'Smith',
        relationship: 'Solicitor',
        telephone1: '01234567890',
      }
      ;(validateNewOfficialContact.validateAddNewOfficialContact as jest.Mock).mockReturnValue({
        firstName: 'First name is required',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        formattedRelationshipList: [
          { value: '', text: 'Select relationship', selected: false },
          { value: 'Solicitor', text: 'Solicitor', selected: true },
          { value: 'Doctor', text: 'Doctor', selected: false },
        ],
        firstName: '',
        lastName: 'Smith',
        relationship: 'Solicitor',
        telephone1: '01234567890',
        errors: { firstName: 'First name is required' },
      })
    })
  })

  describe('application type 3 - Add Social Contact', () => {
    beforeEach(() => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, id: 3 })
      mockGetTemplateData.mockResolvedValue({
        formattedRelationshipList: [
          { value: '', text: 'Select relationship' },
          { value: 'Mother', text: 'Mother' },
          { value: 'Father', text: 'Father' },
        ],
        countries: [
          { value: '', text: 'Select country' },
          { value: 'GB', text: 'United Kingdom' },
          { value: 'IE', text: 'Ireland' },
        ],
      })
    })

    it('validates and saves social contact successfully with dob', async () => {
      mockReq.body = {
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirthOrAge: 'dateofbirth',
        'dob-day': '15',
        'dob-month': '06',
        'dob-year': '1990',
        relationship: 'Mother',
        addressLine1: '123 Main St',
        townOrCity: 'London',
        postcode: 'SW1A 1AA',
        country: 'GB',
        telephone1: '01234567890',
      }
      ;(validateNewSocialContact.validateAddNewSocialContact as jest.Mock).mockReturnValue({})
      ;(countries.getCountryNameByCode as jest.Mock).mockReturnValue('United Kingdom')

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(validateNewSocialContact.validateAddNewSocialContact).toHaveBeenCalledWith(
        {
          ...mockReq.body,
          dob: { day: '15', month: '06', year: '1990' },
        },
        false,
      )
      expect(countries.getCountryNameByCode).toHaveBeenCalledWith('GB')
      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: {
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirthOrAge: 'dateofbirth',
          dob: { day: '15', month: '06', year: '1990' },
          age: undefined,
          relationship: 'Mother',
          addressLine1: '123 Main St',
          addressLine2: undefined,
          townOrCity: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
          telephone1: '01234567890',
          telephone2: undefined,
        },
      })
      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
    })

    it('validates and saves social contact with age instead of dob', async () => {
      mockReq.body = {
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirthOrAge: 'age',
        age: '35',
        relationship: 'Mother',
        telephone1: '01234567890',
        country: 'GB',
      }
      ;(validateNewSocialContact.validateAddNewSocialContact as jest.Mock).mockReturnValue({})
      ;(countries.getCountryNameByCode as jest.Mock).mockReturnValue('United Kingdom')

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: expect.objectContaining({
          age: '35',
          dateOfBirthOrAge: 'age',
        }),
      })
    })

    it('renders form with errors and updates selected options', async () => {
      mockReq.body = {
        firstName: '',
        lastName: 'Doe',
        relationship: 'Mother',
        country: 'GB',
        telephone1: '01234567890',
      }
      ;(validateNewSocialContact.validateAddNewSocialContact as jest.Mock).mockReturnValue({
        firstName: 'First name is required',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        formattedRelationshipList: [
          { value: '', text: 'Select relationship', selected: false },
          { value: 'Mother', text: 'Mother', selected: true },
          { value: 'Father', text: 'Father', selected: false },
        ],
        countries: [
          { value: '', text: 'Select country', selected: false },
          { value: 'GB', text: 'United Kingdom', selected: true },
          { value: 'IE', text: 'Ireland', selected: false },
        ],
        firstName: '',
        lastName: 'Doe',
        relationship: 'Mother',
        country: 'GB',
        telephone1: '01234567890',
        dob: { day: '', month: '', year: '' },
        age: '',
        dateOfBirthOrAge: '',
        errors: { firstName: 'First name is required' },
      })
    })

    it('handles early days centre field', async () => {
      mockReq.body = {
        firstName: 'Jane',
        lastName: 'Doe',
        relationship: 'Mother',
        telephone1: '01234567890',
        country: 'GB',
        earlyDaysCentre: 'yes',
      }
      ;(validateNewSocialContact.validateAddNewSocialContact as jest.Mock).mockReturnValue({})
      ;(countries.getCountryNameByCode as jest.Mock).mockReturnValue('United Kingdom')

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: 'yes',
        additionalData: expect.any(Object),
      })
    })

    it('passes isUpdate flag to validator', async () => {
      mockReq.body = { firstName: 'Jane', lastName: 'Doe', telephone1: '01234567890', country: 'GB' }
      ;(validateNewSocialContact.validateAddNewSocialContact as jest.Mock).mockReturnValue({})
      ;(countries.getCountryNameByCode as jest.Mock).mockReturnValue('United Kingdom')

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions({ isUpdate: true }))

      expect(validateNewSocialContact.validateAddNewSocialContact).toHaveBeenCalledWith(expect.any(Object), true)
    })
  })

  describe('application type 4 - Remove Contact', () => {
    beforeEach(() => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, id: 4 })
    })

    it('validates and saves remove contact successfully', async () => {
      mockReq.body = {
        firstName: 'Bob',
        lastName: 'Jones',
        telephone1: '01234567890',
        telephone2: '07890123456',
        relationship: 'Friend',
      }
      ;(validateRemovePinPhoneContact.validateRemovePinPhoneContact as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(validateRemovePinPhoneContact.validateRemovePinPhoneContact).toHaveBeenCalledWith(mockReq.body)
      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: {
          firstName: 'Bob',
          lastName: 'Jones',
          telephone1: '01234567890',
          telephone2: '07890123456',
          relationship: 'Friend',
        },
      })
      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
    })

    it('renders form with errors', async () => {
      mockReq.body = {
        firstName: '',
        lastName: 'Jones',
        telephone1: '01234567890',
      }
      ;(validateRemovePinPhoneContact.validateRemovePinPhoneContact as jest.Mock).mockReturnValue({
        firstName: 'First name is required',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        firstName: '',
        lastName: 'Jones',
        telephone1: '01234567890',
        errors: { firstName: 'First name is required' },
      })
    })
  })

  describe('application types 5, 6, 7 - Details-based applications', () => {
    it.each([
      [5, false, 'Swap VOs'],
      [6, false, 'Supply List'],
      [7, true, 'General Enquiry'],
    ])('validates and saves details for type %i (required: %s)', async (typeId, isRequired) => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, id: typeId })
      mockReq.body = { details: 'Test details' }
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(validateTextField.validateTextField).toHaveBeenCalledWith({
        fieldValue: 'Test details',
        fieldName: 'Details',
        isRequired,
      })
      expect(session.updateSessionData).toHaveBeenCalledWith(mockReq, {
        earlyDaysCentre: undefined,
        additionalData: { details: 'Test details' },
      })
      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
    })

    it('renders form with errors for type 7 when details missing', async () => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, id: 7 })
      mockReq.body = { details: '' }
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({
        Details: 'Details is required',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        title: 'Test Application',
        details: '',
        errors: { Details: 'Details is required' },
      })
    })
  })

  describe('unknown application type', () => {
    it('redirects immediately for unknown application types', async () => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, id: 999 })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.redirect).toHaveBeenCalledWith('/success')
      expect(session.updateSessionData).not.toHaveBeenCalled()
      expect(mockRes.render).not.toHaveBeenCalled()
    })
  })

  describe('template data', () => {
    it('merges template data from getTemplateData with title', async () => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, genericType: true })
      mockGetTemplateData.mockResolvedValue({
        customField: 'custom value',
        anotherField: 123,
      })
      mockReq.body = { details: 'Test' }
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({
        Details: 'Error',
      })

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockRes.render).toHaveBeenCalledWith('test/template', {
        customField: 'custom value',
        anotherField: 123,
        title: 'Test Application',
        details: 'Test',
        errors: { Details: 'Error' },
      })
    })

    it('calls getTemplateData with correct parameters', async () => {
      mockGetAppType.mockReturnValue({ ...baseApplicationType, genericType: true })
      mockReq.body = { details: 'Test' }
      ;(validateTextField.validateTextField as jest.Mock).mockReturnValue({})

      await handleApplicationDetails(mockReq as Request, mockRes as Response, getOptions())

      expect(mockGetTemplateData).toHaveBeenCalledWith(mockReq, mockRes, { ...baseApplicationType, genericType: true })
    })
  })
})
