// A TimeSpan allows you to give meaning to a number and then read that number back and compare them in different formats
// ie.
// seconds(60).minutes === 1
// seconds(30).seconds === 30
// minutes(1).seconds === 60
// milliseconds(1000).seconds === 1
// milliseconds(2000).isEqualTo(seconds(2)) #=> true
// minutes(5).
// This allows a caller to just accept a TimeSpan and then work in the units it cares about

export const minutes = (numMinutes: number): TimeSpan => TimeSpan.minutes(numMinutes)

export const seconds = (numSeconds: number): TimeSpan => TimeSpan.seconds(numSeconds)

export const milliseconds = (numMilliseconds: number): TimeSpan => TimeSpan.milliseconds(numMilliseconds)

export const nothing = (): TimeSpan => TimeSpan.nothing()

// Get a time span in the past
export const timeAgo = (ago: TimeSpan) => milliseconds(Date.now() - ago.milliseconds)

// Get a time span in the future
export const timeFromNow = (fromNow: TimeSpan) => milliseconds(Date.now() + fromNow.milliseconds)

// Implementation
export class TimeSpan {
  readonly minutes: number

  readonly seconds: number

  readonly milliseconds: number

  private constructor(numMinutes: number, numSeconds: number, numMilliseconds: number) {
    this.minutes = numMinutes
    this.seconds = numSeconds
    this.milliseconds = numMilliseconds
  }

  static minutes(numMinutes: number): TimeSpan {
    return new TimeSpan(numMinutes, numMinutes * 60, TimeSpan.seconds(numMinutes * 60).milliseconds)
  }

  static seconds(numSeconds: number): TimeSpan {
    return new TimeSpan(numSeconds / 60, numSeconds, numSeconds * 1000)
  }

  static milliseconds(numMilliseconds: number): TimeSpan {
    return new TimeSpan(TimeSpan.seconds(numMilliseconds / 1000).minutes, numMilliseconds / 1000, numMilliseconds)
  }

  static nothing(): TimeSpan {
    return new TimeSpan(0, 0, 0)
  }

  isGreaterThan(t: TimeSpan): boolean {
    return this.milliseconds > t.milliseconds
  }

  isGreaterThanOrEqualTo(t: TimeSpan): boolean {
    return this.milliseconds >= t.milliseconds
  }

  isLessThan(t: TimeSpan): boolean {
    return this.milliseconds < t.milliseconds
  }

  isLessThanOrEqualTo(t: TimeSpan): boolean {
    return this.milliseconds <= t.milliseconds
  }

  isEqualTo(t: TimeSpan): boolean {
    return this.milliseconds === t.milliseconds
  }
}
