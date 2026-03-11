import { Request } from 'express'
import { PHOTO_KEYS } from '../constants/photos'
import { updateSessionData } from '../utils/http/session'
import { URLS } from '../constants/urls'

type LoggingMethod = 'manual' | 'webcam'

export default function handleLoggingMethodSelection(req: Request, loggingMethod: LoggingMethod) {
  const { applicationData } = req.session
  const previousMethod = applicationData?.loggingMethod
  const methodChanged = previousMethod !== loggingMethod

  updateSessionData(req, { loggingMethod })

  if (loggingMethod === 'manual') {
    if (methodChanged && previousMethod === 'webcam') {
      updateSessionData(req, {
        photos: undefined,
        photoAdditionalDetails: undefined,
        currentPhoto: undefined,
        isFromCheckDetailsPage: false,
      })
    }
    return { redirectUrl: URLS.LOG_APPLICATION_DETAILS }
  }

  if (loggingMethod === 'webcam') {
    if (methodChanged && previousMethod === 'manual') {
      updateSessionData(req, {
        additionalData: {
          ...applicationData?.additionalData,
          amount: undefined,
          reason: undefined,
          details: undefined,
        },
      })
    }

    updateSessionData(req, {
      currentPhoto: PHOTO_KEYS.PHOTO_1,
      isFromCheckDetailsPage: false,
      photos: methodChanged ? {} : applicationData?.photos || {},
    })

    return { redirectUrl: URLS.LOG_PHOTO_CAPTURE }
  }

  return { redirectUrl: URLS.LOG_METHOD }
}
