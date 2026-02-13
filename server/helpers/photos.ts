import { Request } from 'express'
import { PHOTO_KEYS, MAX_PHOTOS } from '../constants/photos'
import { URLS } from '../constants/urls'

export function getBackLink(req: Request): string {
  const { applicationData } = req.session
  if (!applicationData) return URLS.LOG_METHOD

  const photos = applicationData.photos ?? {}
  const currentPhoto = applicationData.currentPhoto ?? PHOTO_KEYS.PHOTO_1
  const photoCount = Object.keys(photos).length

  switch (req.path) {
    case URLS.LOG_ADDITIONAL_PHOTO_DETAILS:
      return photoCount >= MAX_PHOTOS ? URLS.LOG_CONFIRM_PHOTO_CAPTURE : URLS.LOG_ADD_ANOTHER_PHOTO

    case URLS.LOG_ADD_ANOTHER_PHOTO:
      return URLS.LOG_CONFIRM_PHOTO_CAPTURE

    case URLS.LOG_CONFIRM_PHOTO_CAPTURE:
      return URLS.LOG_PHOTO_CAPTURE

    case URLS.LOG_PHOTO_CAPTURE:
      if (currentPhoto === PHOTO_KEYS.PHOTO_2) {
        return URLS.LOG_ADD_ANOTHER_PHOTO
      }
      return URLS.LOG_METHOD

    default:
      return URLS.LOG_METHOD
  }
}

export function resetSecondPhotoIfExists(req: Request) {
  const { applicationData } = req.session
  if (!applicationData) return

  const photos = applicationData.photos ?? {}

  if (photos.photo2) {
    delete photos.photo2
    req.session.applicationData = {
      ...applicationData,
      photos,
      currentPhoto: PHOTO_KEYS.PHOTO_1,
      addAnotherPhoto: null,
    }
  }
}

export function createPhotoFromFile(
  file: Express.Multer.File,
  currentPhoto: string,
): {
  buffer: Buffer
  mimetype: string
  filename: string
} {
  const fileExtension = file.originalname.split('.').pop()
  const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '')

  return {
    buffer: file.buffer,
    mimetype: file.mimetype,
    filename: `${fileNameWithoutExt}[${currentPhoto}].${fileExtension}`,
  }
}
