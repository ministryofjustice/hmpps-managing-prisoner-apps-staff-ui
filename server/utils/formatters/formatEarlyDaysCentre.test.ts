// formatEarlyDaysCentre.test.ts
import formatEarlyDaysCentre from './formatEarlyDaysCentre'

describe('formatEarlyDaysCentre (aggressive early-return version)', () => {
  describe('when earlyDaysCentreFromSession is valid', () => {
    it('returns "yes" when session is "yes" (ignores firstNightCenter)', () => {
      expect(formatEarlyDaysCentre('yes', false, false)).toBe('yes')
      expect(formatEarlyDaysCentre('yes', true, false)).toBe('yes')
      expect(formatEarlyDaysCentre('yes', null, false)).toBe('yes')
      expect(formatEarlyDaysCentre('yes', undefined, false)).toBe('yes')
    })

    it('returns "no" when session is "no" (ignores firstNightCenter)', () => {
      expect(formatEarlyDaysCentre('no', true, false)).toBe('no')
      expect(formatEarlyDaysCentre('no', false, false)).toBe('no')
      expect(formatEarlyDaysCentre('no', null, false)).toBe('no')
      expect(formatEarlyDaysCentre('no', undefined, false)).toBe('no')
    })

    it('capitalises session value when capitalize=true', () => {
      expect(formatEarlyDaysCentre('yes', false, true)).toBe('Yes')
      expect(formatEarlyDaysCentre('no', true, true)).toBe('No')
    })
  })

  describe('when earlyDaysCentreFromSession is missing or invalid', () => {
    it('returns "yes" when firstNightCenter=true', () => {
      expect(formatEarlyDaysCentre(undefined, true, false)).toBe('yes')
      expect(formatEarlyDaysCentre('', true, false)).toBe('yes')
      expect(formatEarlyDaysCentre('maybe', true, false)).toBe('yes')
      expect(formatEarlyDaysCentre('YES', true, false)).toBe('yes') // not accepted as valid input
    })

    it('returns "no" when firstNightCenter=false', () => {
      expect(formatEarlyDaysCentre(undefined, false, false)).toBe('no')
      expect(formatEarlyDaysCentre('', false, false)).toBe('no')
      expect(formatEarlyDaysCentre('maybe', false, false)).toBe('no')
      expect(formatEarlyDaysCentre('NO', false, false)).toBe('no') // not accepted as valid input
    })

    it('returns "" when firstNightCenter is null/undefined and session is invalid', () => {
      expect(formatEarlyDaysCentre(undefined, null, false)).toBe('')
      expect(formatEarlyDaysCentre(undefined, undefined, false)).toBe('')
      expect(formatEarlyDaysCentre('', null, false)).toBe('')
      expect(formatEarlyDaysCentre('maybe', undefined, false)).toBe('')
    })

    it('capitalises fallback values when capitalize=true', () => {
      expect(formatEarlyDaysCentre(undefined, true, true)).toBe('Yes')
      expect(formatEarlyDaysCentre(undefined, false, true)).toBe('No')
    })

    it('still returns "" when capitalize=true but there is no value', () => {
      expect(formatEarlyDaysCentre(undefined, null, true)).toBe('')
      expect(formatEarlyDaysCentre('maybe', undefined, true)).toBe('')
    })
  })

  describe('default behaviour', () => {
    it('does not capitalise by default (capitalize defaults to false)', () => {
      expect(formatEarlyDaysCentre('yes', null)).toBe('yes')
      expect(formatEarlyDaysCentre('no', null)).toBe('no')
      expect(formatEarlyDaysCentre(undefined, true)).toBe('yes')
      expect(formatEarlyDaysCentre(undefined, false)).toBe('no')
      expect(formatEarlyDaysCentre(undefined, null)).toBe('')
    })
  })
})
