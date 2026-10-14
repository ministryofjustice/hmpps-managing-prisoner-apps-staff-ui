import { isOpenStatus } from '../../constants/applicationStatus'

const SLA_WORKING_DAYS = 5

const isApplicationOverdue = (createdDate: string, status: string, now = new Date()): boolean => {
  const createdAt = Date.parse(createdDate)

  if (!isOpenStatus(status) || !Number.isFinite(createdAt)) {
    return false
  }

  const dueAt = new Date(createdAt)
  dueAt.setUTCHours(0, 0, 0, 0)

  dueAt.setUTCDate(dueAt.getUTCDate() + 1)

  let workingDays = 0
  while (workingDays < SLA_WORKING_DAYS) {
    const weekday = dueAt.getUTCDay()

    if (weekday !== 0 && weekday !== 6) workingDays += 1

    dueAt.setUTCDate(dueAt.getUTCDate() + 1)
  }

  return now.getTime() >= dueAt.getTime()
}

export default isApplicationOverdue
