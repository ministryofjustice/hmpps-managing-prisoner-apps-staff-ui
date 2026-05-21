import { convertToTitleCase } from '../utils'

enum NameFormatStyle {
  firstMiddleLast,
  lastCommaFirstMiddle,
  lastCommaFirst,
  firstLast,
}

export const formatName = (
  firstName: string,
  middleNames: string,
  lastName: string,
  options?: { style: NameFormatStyle },
): string => {
  const names = [firstName, middleNames, lastName]
  if (options?.style === NameFormatStyle.lastCommaFirstMiddle) {
    names.unshift(`${names.pop()},`)
  } else if (options?.style === NameFormatStyle.lastCommaFirst) {
    names.unshift(`${names.pop()},`)
    names.pop()
  } else if (options?.style === NameFormatStyle.firstLast) {
    names.splice(1, 1)
  }
  return names
    .filter(s => s)
    .map(s => s.toLowerCase())
    .join(' ')
    .replace(/(^\w)|([\s'-]+\w)/g, letter => letter.toUpperCase())
}

export const formatMessagesCreatedByName = (fullName: string, createdByType: 'PRISONER' | 'STAFF'): string => {
  if (createdByType !== 'PRISONER') {
    return fullName
  }

  const formattedName = fullName
    .trim()
    .split(/\s+/)
    .map(part => {
      const match = part.match(/^([^A-Za-z]*)([A-Za-z'-]+)([^A-Za-z]*)$/)

      if (!match) {
        return part
      }

      const [, prefix, coreName, suffix] = match
      return `${prefix}${convertToTitleCase(coreName)}${suffix}`
    })
    .filter(Boolean)
    .join(' ')

  return formattedName
}
