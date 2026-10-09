import { isOpenStatus } from '../../constants/applicationStatus'
import { milliseconds, minutes } from '../../utils/timeSpans'

const MINUTES_PER_DAY = 24 * 60
const SLA_DURATION = minutes(5 * MINUTES_PER_DAY)

const isApplicationOverdue = (createdDate: string, status: string, now = new Date()): boolean => {
  const createdAt = Date.parse(createdDate)

  if (!isOpenStatus(status) || !Number.isFinite(createdAt)) {
    return false
  }

  const slaStart = new Date(createdAt)
  slaStart.setUTCHours(0, 0, 0, 0)
  slaStart.setUTCDate(slaStart.getUTCDate() + 1)

  const elapsedSinceSlaStart = milliseconds(now.getTime() - slaStart.getTime())
  return elapsedSinceSlaStart.isGreaterThanOrEqualTo(SLA_DURATION)
}

export default isApplicationOverdue
