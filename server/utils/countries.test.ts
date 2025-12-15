import { Country } from '../constants/countries'
import { getCountryNameByCode, getFormattedCountries } from './countries'

jest.mock('../constants/countries', () => ({
  countries: [
    { value: 'GB', text: 'United Kingdom' },
    { value: 'US', text: 'United States' },
  ],
}))

describe(getFormattedCountries.name, () => {
  const baseCountries: Country[] = [
    { value: 'GB', text: 'United Kingdom' },
    { value: 'US', text: 'United States' },
    { value: 'FR', text: 'France' },
  ]

  it('returns all countries with selected=false when no selectedValue is provided', () => {
    const result = getFormattedCountries(baseCountries)

    expect(result).toEqual([
      { value: 'GB', text: 'United Kingdom', selected: false },
      { value: 'US', text: 'United States', selected: false },
      { value: 'FR', text: 'France', selected: false },
    ])
  })

  it('marks the matching country as selected', () => {
    const result = getFormattedCountries(baseCountries, 'United States')

    expect(result.find(c => c.text === 'United States')?.selected).toBe(true)
  })

  it('only selects the first matching country', () => {
    const countriesWithDuplicateText: Country[] = [
      { value: 'US', text: 'United States' },
      { value: 'USA', text: 'United States' },
    ]

    const result = getFormattedCountries(countriesWithDuplicateText, 'United States')

    expect(result[0].selected).toBe(true)
    expect(result[1].selected).toBe(false)
  })

  it('does not select a country if it is disabled', () => {
    const countriesWithDisabled: Country[] = [
      { value: 'US', text: 'United States', disabled: true },
      { value: 'GB', text: 'United Kingdom' },
    ]

    const result = getFormattedCountries(countriesWithDisabled, 'United States')

    expect(result[0].selected).toBe(false)
  })

  it('selects the next valid country if the first matching one is disabled', () => {
    const countriesWithDisabled: Country[] = [
      { value: 'US', text: 'United States', disabled: true },
      { value: 'USA', text: 'United States' },
    ]

    const result = getFormattedCountries(countriesWithDisabled, 'United States')

    expect(result[0].selected).toBe(false)
    expect(result[1].selected).toBe(true)
  })
})

describe(getCountryNameByCode.name, () => {
  it('returns empty string when no code is provided', () => {
    expect(getCountryNameByCode()).toBe('')
  })

  it('returns the country name when a matching code exists', () => {
    expect(getCountryNameByCode('GB')).toBe('United Kingdom')
    expect(getCountryNameByCode('US')).toBe('United States')
  })

  it('returns the code itself when no matching country is found', () => {
    expect(getCountryNameByCode('ZZ')).toBe('ZZ')
  })
})
