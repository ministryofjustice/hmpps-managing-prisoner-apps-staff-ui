import { Country, countries } from '../constants/countries'

export function getFormattedCountries(
  countryList: Country[],
  selectedValue?: string,
): (Country & { selected?: boolean })[] {
  return countryList.map(item => ({
    ...item,
    selected: item.text === selectedValue,
  }))
}

export function getCountryNameByCode(code?: string): string {
  if (!code) return ''
  const matchedCountry = countries.find(c => c.value === code)
  return matchedCountry?.text || code
}
