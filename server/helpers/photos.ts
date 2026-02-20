import { Request } from 'express'
import { ApplicationData } from 'express-session'

import { PHOTO_KEYS, MAX_PHOTOS } from '../constants/photos'
import { URLS } from '../constants/urls'
import { updateSessionData } from '../utils/http/session'

type PhotoKey = (typeof PHOTO_KEYS)[keyof typeof PHOTO_KEYS]

export interface PhotoForDisplay {
  buffer: Buffer
  mimetype: string
  filename: string
  imgSrc: string
}

export interface GetPhotosData {
  photosForDisplay: Record<string, PhotoForDisplay> | undefined
  photoDetails: string | undefined
  hasNoPhotos: boolean
}

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

  let fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '')

  fileNameWithoutExt = fileNameWithoutExt.replace(/\[photo\d+\]$/, '')

  return {
    buffer: file.buffer,
    mimetype: file.mimetype,
    filename: `${fileNameWithoutExt}[${currentPhoto}].${fileExtension}`,
  }
}

export function handlePhotoQueryParams(req: Request, retake?: string, image?: string): void {
  const { applicationData } = req.session
  if (!applicationData) return

  let currentPhoto: PhotoKey | undefined
  let isFromCheckDetailsPage = false

  if (retake && Object.values(PHOTO_KEYS).includes(retake as PhotoKey)) {
    currentPhoto = retake as PhotoKey
    isFromCheckDetailsPage = true
  }

  if (!currentPhoto && image) {
    const key = `photo${image}` as PhotoKey
    if (Object.values(PHOTO_KEYS).includes(key)) {
      currentPhoto = key
      isFromCheckDetailsPage = true
    }
  }

  if (currentPhoto) {
    updateSessionData(req, { currentPhoto, isFromCheckDetailsPage })
  } else if (!applicationData.currentPhoto) {
    currentPhoto = PHOTO_KEYS.PHOTO_1
    updateSessionData(req, { currentPhoto })
  }
}

export function getPhotosForDisplay(applicationData: ApplicationData): GetPhotosData {
  let photosForDisplay: Record<string, PhotoForDisplay> | undefined
  let photoDetails: string | undefined
  let hasNoPhotos = false

  if (applicationData?.loggingMethod === 'webcam') {
    const photos = applicationData.photos ?? {}
    photoDetails = applicationData.photoAdditionalDetails

    photosForDisplay = {}
    for (const key of Object.keys(photos)) {
      const photo = photos[key as keyof typeof photos]
      photosForDisplay[key] = {
        ...photo,
        imgSrc: `data:${photo.mimetype};base64,${Buffer.from(photo.buffer).toString('base64')}`,
      }
    }

    hasNoPhotos = Object.keys(photos).length === 0
  }

  return {
    photosForDisplay,
    photoDetails,
    hasNoPhotos,
  }
}
