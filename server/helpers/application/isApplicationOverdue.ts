import { isOpenStatus } from '../../constants/applicationStatus'

const SLA_DURATION_MS = 5 * 24 * 60 * 60 * 1000
const DAY_DURATION_MS = 24 * 60 * 60 * 1000

const isApplicationOverdue = (createdDate: string, status: string, now = new Date()): boolean => {
  const createdAt = Date.parse(createdDate)

  if (!isOpenStatus(status) || !Number.isFinite(createdAt)) {
    return false
  }

  const createdDayStart = new Date(createdAt)
  createdDayStart.setUTCHours(0, 0, 0, 0)
  const slaStart = createdDayStart.getTime() + DAY_DURATION_MS

  return now.getTime() >= slaStart + SLA_DURATION_MS
}

export default isApplicationOverdue
