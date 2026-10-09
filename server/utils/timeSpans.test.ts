import { milliseconds, minutes, seconds, timeAgo, timeFromNow, TimeSpan } from './timeSpans'

describe('time spans', () => {
  describe('minutes', () => {
    const cases = [
      [1, 1, 60, 60000],
      [5, 5, 300, 300000],
      [0.5, 0.5, 30, 30000],
      [0, 0, 0, 0],
    ]

    test.each(cases)(
      'Given %p minute(s), minutes is %p, seconds is %p and milliseconds is %p',
      (example, expectedMinutes, expectedSeconds, expectedMilliseconds) => {
        const subject = minutes(example)
        expect(subject.minutes).toEqual(expectedMinutes)
        expect(subject.seconds).toEqual(expectedSeconds)
        expect(subject.milliseconds).toEqual(expectedMilliseconds)
      },
    )
  })

  describe('seconds', () => {
    const cases = [
      [1, 0.01666667, 1, 1000],
      [60, 1, 60, 60000],
      [120, 2, 120, 120000],
    ]

    test.each(cases)(
      'Given %p seconds(s), minutes is %p, seconds is %p and milliseconds is %p',
      (example, expectedMinutes, expectedSeconds, expectedMilliseconds) => {
        const subject = seconds(example)
        expect(subject.minutes).toBeCloseTo(expectedMinutes)
        expect(subject.seconds).toEqual(expectedSeconds)
        expect(subject.milliseconds).toEqual(expectedMilliseconds)
      },
    )
  })

  describe('milliseconds', () => {
    const cases = [
      [1, 0.00001667, 0.001, 1],
      [1000, 0.01666667, 1, 1000],
    ]

    test.each(cases)(
      'Given %p milliseconds(s), minutes is %p, seconds is %p and milliseconds is %p',
      (example, expectedMinutes, expectedSeconds, expectedMilliseconds) => {
        const subject = milliseconds(example)
        expect(subject.minutes).toBeCloseTo(expectedMinutes)
        expect(subject.seconds).toEqual(expectedSeconds)
        expect(subject.milliseconds).toEqual(expectedMilliseconds)
      },
    )
  })

  describe('isEqualTo', () => {
    const cases: [string, TimeSpan, TimeSpan, boolean][] = [
      ['60 seconds is equal to 1 minute', seconds(60), minutes(1), true],
      ['120 seconds is equal to 1 and a half minutes', seconds(90), minutes(1.5), true],
      ['2 and a half seconds is equal to 2500 milliseconds', seconds(2.5), milliseconds(2500), true],
      ['120 minutes is equal to 7200 seconds', minutes(120), seconds(7200), true],
      ['120 minutes is not equal to 7000 seconds', minutes(120), seconds(7000), false],
      ['1 seconds is not equal to 1 minutes', seconds(1), minutes(1), false],
    ]

    test.each(cases)('%s', (testCaseDescription, example1, example2, expectedResult) => {
      expect(example1.isEqualTo(example2)).toBe(expectedResult)
    })
  })

  describe('isGreaterThan', () => {
    const cases: [string, TimeSpan, TimeSpan, boolean][] = [
      ['61 seconds is greater than 1 minute', seconds(61), minutes(1), true],
      ['125 seconds is greater than 1 and a half minutes', seconds(121), minutes(1.5), true],
      ['60 seconds is not greater than 1 minute', seconds(60), minutes(1), false],
      ['1 minute is not greater than 61 seconds', minutes(1), seconds(61), false],
    ]

    test.each(cases)('%s', (testCaseDescription, example1, example2, expectedResult) => {
      expect(example1.isGreaterThan(example2)).toBe(expectedResult)
    })
  })

  describe('timeAgo', () => {
    const dateNowInMs: number = 1770000000000

    beforeEach(() => {
      Date.now = jest.fn(() => dateNowInMs)
    })

    const cases: [string, number, TimeSpan][] = [
      ['1 millisecond', dateNowInMs - 1, milliseconds(1)],
      ['1 second', dateNowInMs - 1000, seconds(1)],
      ['30 seconds', dateNowInMs - 30000, seconds(30)],
      ['2 minutes', dateNowInMs - 120000, minutes(2)],
    ]

    test.each(cases)(
      'Given a current time in milliseconds 1770000000000 and a timespan of %p, the expected past timespan in milliseconds is %p',
      (description, expectedMilliseconds, example) => {
        expect(timeAgo(example).milliseconds).toEqual(expectedMilliseconds)
      },
    )
  })

  describe('timeFromNow', () => {
    const dateNowInMs: number = 1770000000000

    beforeEach(() => {
      Date.now = jest.fn(() => dateNowInMs)
    })

    const cases: [string, number, TimeSpan][] = [
      ['1 millisecond', dateNowInMs + 1, milliseconds(1)],
      ['1 second', dateNowInMs + 1000, seconds(1)],
      ['30 seconds', dateNowInMs + 30000, seconds(30)],
      ['2 minutes', dateNowInMs + 120000, minutes(2)],
    ]

    test.each(cases)(
      'Given a current time in milliseconds 1770000000000 and a timespan of %p, the expected future timespan in milliseconds is %p',
      (description, expectedMilliseconds, example) => {
        expect(timeFromNow(example).milliseconds).toEqual(expectedMilliseconds)
      },
    )
  })
})
