export default function formatEarlyDaysCentre(
  earlyDaysCentreFromSession?: string,
  firstNightCenter?: boolean | null,
  capitalize = false,
): string {
  const capitalise = (val: string) => (capitalize ? val.charAt(0).toUpperCase() + val.slice(1) : val)

  if (earlyDaysCentreFromSession === 'yes' || earlyDaysCentreFromSession === 'no') {
    return capitalise(earlyDaysCentreFromSession)
  }

  if (firstNightCenter === true) {
    return capitalise('yes')
  }

  if (firstNightCenter === false) {
    return capitalise('no')
  }

  return ''
}
