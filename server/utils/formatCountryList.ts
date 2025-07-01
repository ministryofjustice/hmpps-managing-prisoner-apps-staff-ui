import { Country } from '../constants/countries'

// eslint-disable-next-line import/prefer-default-export
export function getFormattedCountries(
  countryList: Country[],
  selectedValue?: string,
): (Country & { selected?: boolean })[] {
  return countryList.map(country => ({
    ...country,
    selected: country.value === selectedValue,
  }))
}
