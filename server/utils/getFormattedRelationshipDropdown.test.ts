import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'
import PersonalRelationshipsService from '../services/personalRelationshipsService'
import getFormattedRelationshipDropdown, {
  formatRelationshipList,
  RawRelationship,
} from './getFormattedRelationshipDropdown'

describe(formatRelationshipList.name, () => {
  const mockRelationships: RawRelationship[] = [
    { code: 'MOTHER', description: 'Mother', isActive: true },
    { code: 'FATHER', description: 'Father', isActive: true },
    { code: 'SISTER', description: 'Sister', isActive: true },
    { code: 'BROTHER', description: 'Brother', isActive: false },
    { code: 'FRIEND', description: 'Friend', isActive: true },
  ]

  describe('when no value is selected', () => {
    it('returns placeholder option as selected followed by active relationships', () => {
      const result = formatRelationshipList(mockRelationships, 'Choose relationship')

      expect(result).toEqual([
        { value: '', text: 'Choose relationship', selected: true },
        { value: 'Mother', text: 'Mother', selected: false },
        { value: 'Father', text: 'Father', selected: false },
        { value: 'Sister', text: 'Sister', selected: false },
        { value: 'Friend', text: 'Friend', selected: false },
      ])
    })

    it('filters out inactive relationships', () => {
      const result = formatRelationshipList(mockRelationships, 'Choose relationship')

      const brotherOption = result.find(option => option.text === 'Brother')
      expect(brotherOption).toBeUndefined()
    })
  })

  describe('when a value is selected', () => {
    it('marks the matching relationship as selected', () => {
      const result = formatRelationshipList(mockRelationships, 'Choose relationship', 'Father')

      expect(result).toEqual([
        { value: '', text: 'Choose relationship', selected: false },
        { value: 'Mother', text: 'Mother', selected: false },
        { value: 'Father', text: 'Father', selected: true },
        { value: 'Sister', text: 'Sister', selected: false },
        { value: 'Friend', text: 'Friend', selected: false },
      ])
    })

    it('marks placeholder as not selected', () => {
      const result = formatRelationshipList(mockRelationships, 'Choose relationship', 'Mother')

      const placeholder = result[0]
      expect(placeholder.selected).toBe(false)
    })

    it('handles selection of non-existent value gracefully', () => {
      const result = formatRelationshipList(mockRelationships, 'Choose relationship', 'Cousin')

      const selectedOptions = result.filter(option => option.selected)
      expect(selectedOptions).toHaveLength(0)
      expect(result[0].selected).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles empty relationships array', () => {
      const result = formatRelationshipList([], 'Choose relationship')

      expect(result).toEqual([{ value: '', text: 'Choose relationship', selected: true }])
    })

    it('handles all inactive relationships', () => {
      const inactiveRelationships: RawRelationship[] = [
        { code: 'MOTHER', description: 'Mother', isActive: false },
        { code: 'FATHER', description: 'Father', isActive: false },
      ]

      const result = formatRelationshipList(inactiveRelationships, 'Choose relationship')

      expect(result).toEqual([{ value: '', text: 'Choose relationship', selected: true }])
    })

    it('preserves order of relationships', () => {
      const result = formatRelationshipList(mockRelationships, 'Choose relationship')

      expect(result.map(r => r.text)).toEqual(['Choose relationship', 'Mother', 'Father', 'Sister', 'Friend'])
    })
  })

  describe('placeholder text', () => {
    it('uses custom default text', () => {
      const result = formatRelationshipList(mockRelationships, 'Pick one')

      expect(result[0]).toEqual({
        value: '',
        text: 'Pick one',
        selected: true,
      })
    })
  })
})

describe(getFormattedRelationshipDropdown.name, () => {
  let mockPersonalRelationshipsService: jest.Mocked<PersonalRelationshipsService>

  const mockRelationships: RawRelationship[] = [
    { code: 'SOLICITOR', description: 'Solicitor', isActive: true },
    { code: 'SOCIAL_WORKER', description: 'Social Worker', isActive: true },
    { code: 'PROBATION', description: 'Probation Officer', isActive: false },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    mockPersonalRelationshipsService = {
      getRelationships: jest.fn().mockResolvedValue(mockRelationships),
    } as unknown as jest.Mocked<PersonalRelationshipsService>
  })

  describe('with default parameters', () => {
    it('fetches relationships using SOCIAL_RELATIONSHIP group code', async () => {
      await getFormattedRelationshipDropdown(mockPersonalRelationshipsService)

      expect(mockPersonalRelationshipsService.getRelationships).toHaveBeenCalledWith(
        PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP,
      )
    })

    it('returns formatted list with default placeholder text', async () => {
      const result = await getFormattedRelationshipDropdown(mockPersonalRelationshipsService)

      expect(result).toEqual([
        { value: '', text: 'Select a relationship', selected: true },
        { value: 'Solicitor', text: 'Solicitor', selected: false },
        { value: 'Social Worker', text: 'Social Worker', selected: false },
      ])
    })

    it('filters out inactive relationships', async () => {
      const result = await getFormattedRelationshipDropdown(mockPersonalRelationshipsService)

      const probationOption = result.find(option => option.text === 'Probation Officer')
      expect(probationOption).toBeUndefined()
    })
  })

  describe('with selectedValue parameter', () => {
    it('marks the selected value as selected', async () => {
      const result = await getFormattedRelationshipDropdown(mockPersonalRelationshipsService, 'Solicitor')

      expect(result).toEqual([
        { value: '', text: 'Select a relationship', selected: false },
        { value: 'Solicitor', text: 'Solicitor', selected: true },
        { value: 'Social Worker', text: 'Social Worker', selected: false },
      ])
    })
  })

  describe('with custom groupCode parameter', () => {
    it('fetches relationships using specified group code', async () => {
      await getFormattedRelationshipDropdown(mockPersonalRelationshipsService, undefined, 'OFFICIAL_RELATIONSHIP')

      expect(mockPersonalRelationshipsService.getRelationships).toHaveBeenCalledWith(
        PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP,
      )
    })

    it('formats relationships correctly with custom group code', async () => {
      const result = await getFormattedRelationshipDropdown(
        mockPersonalRelationshipsService,
        'Social Worker',
        'OFFICIAL_RELATIONSHIP',
      )

      expect(result).toEqual([
        { value: '', text: 'Select a relationship', selected: false },
        { value: 'Solicitor', text: 'Solicitor', selected: false },
        { value: 'Social Worker', text: 'Social Worker', selected: true },
      ])
    })
  })

  describe('with all parameters', () => {
    it('combines all parameters correctly', async () => {
      const result = await getFormattedRelationshipDropdown(
        mockPersonalRelationshipsService,
        'Solicitor',
        'OFFICIAL_RELATIONSHIP',
      )

      expect(mockPersonalRelationshipsService.getRelationships).toHaveBeenCalledWith(
        PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP,
      )
      expect(result).toEqual([
        { value: '', text: 'Select a relationship', selected: false },
        { value: 'Solicitor', text: 'Solicitor', selected: true },
        { value: 'Social Worker', text: 'Social Worker', selected: false },
      ])
    })
  })

  describe('error handling', () => {
    it('propagates service errors', async () => {
      const error = new Error('Service unavailable')
      mockPersonalRelationshipsService.getRelationships.mockRejectedValue(error)

      await expect(getFormattedRelationshipDropdown(mockPersonalRelationshipsService)).rejects.toThrow(
        'Service unavailable',
      )
    })
  })

  describe('edge cases', () => {
    it('handles empty relationships from service', async () => {
      mockPersonalRelationshipsService.getRelationships.mockResolvedValue([])

      const result = await getFormattedRelationshipDropdown(mockPersonalRelationshipsService)

      expect(result).toEqual([{ value: '', text: 'Select a relationship', selected: true }])
    })
  })
})
