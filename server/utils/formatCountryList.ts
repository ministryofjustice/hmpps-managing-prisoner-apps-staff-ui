import { Country, countries } from '../constants/countries'

export function getFormattedCountries(
  countryList: Country[],
  selectedValue?: string,
): (Country & { selected?: boolean })[] {
  let selectedFound = false

  return countryList.map(item => {
    const isSelected = !selectedFound && item.text === selectedValue && !item.disabled
    if (isSelected) selectedFound = true
    return {
      ...item,
      selected: isSelected,
    }
  })
}

export function getCountryNameByCode(code?: string): string {
  if (!code) return ''
  const matchedCountry = countries.find(c => c.value === code)
  return matchedCountry?.text || code
}
