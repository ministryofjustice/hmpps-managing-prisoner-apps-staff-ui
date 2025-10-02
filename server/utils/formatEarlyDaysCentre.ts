export default function formatEarlyDaysCentre(
  earlyDaysCentreFromSession?: string,
  firstNightCenter?: boolean | null,
  capitalize = false,
): string {
  let value: string

  if (earlyDaysCentreFromSession === 'yes' || earlyDaysCentreFromSession === 'no') {
    value = earlyDaysCentreFromSession
  } else if (firstNightCenter === true) {
    value = 'yes'
  } else if (firstNightCenter === false) {
    value = 'no'
  } else {
    value = ''
  }

  if (capitalize && value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  return value
}
