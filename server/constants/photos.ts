export const PHOTO_KEYS = {
  PHOTO_1: 'photo1',
  PHOTO_2: 'photo2',
} as const

export const MAX_PHOTOS = 2

export type PhotoKey = (typeof PHOTO_KEYS)[keyof typeof PHOTO_KEYS]
