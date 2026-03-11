import { Request } from 'express'
import handleLoggingMethodSelection from './logMethod'
import { PHOTO_KEYS } from '../constants/photos'
import { updateSessionData } from '../utils/http/session'

jest.mock('../utils/http/session', () => ({
  updateSessionData: jest.fn(),
}))

describe('handleLoggingMethodSelection', () => {
  let req: Request

  beforeEach(() => {
    jest.clearAllMocks()

    req = {
      session: {
        applicationData: {
          loggingMethod: undefined,
          additionalData: {},
          photos: {
            photo1: {
              buffer: Buffer.from('base64string'),
              mimetype: 'image/jpeg',
              filename: 'photo1.jpg',
              size: 1024,
            },
          },
        },
      },
    } as unknown as Request
  })

  it('should call updateSessionData correctly when manual is selected', () => {
    const result = handleLoggingMethodSelection(req, 'manual')

    expect(updateSessionData).toHaveBeenCalled()
    expect(updateSessionData).toHaveBeenCalledWith(req, { loggingMethod: 'manual' })
    expect(result.redirectUrl).toBe('/log/application-details')
  })

  it('should reset photo journey when webcam is selected', () => {
    const result = handleLoggingMethodSelection(req, 'webcam')

    expect(updateSessionData).toHaveBeenCalledWith(req, { loggingMethod: 'webcam' })
    expect(updateSessionData).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        currentPhoto: PHOTO_KEYS.PHOTO_1,
        isFromCheckDetailsPage: false,
        photos: {},
      }),
    )

    expect(result.redirectUrl).toBe('/log/photo-capture')
  })

  it('should clear manual data when switching from manual to webcam', () => {
    if (req.session?.applicationData) {
      req.session.applicationData.loggingMethod = 'manual'
      req.session.applicationData.additionalData = { amount: '2', reason: 'Emergency' }
    }

    const result = handleLoggingMethodSelection(req, 'webcam')

    expect(updateSessionData).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        additionalData: {},
      }),
    )
    expect(result.redirectUrl).toBe('/log/photo-capture')
  })

  it('should clear photos when switching from webcam to manual', () => {
    if (req.session?.applicationData) {
      req.session.applicationData.loggingMethod = 'webcam'
      req.session.applicationData.photos = {
        photo1: {
          buffer: Buffer.from('base64string'),
          mimetype: 'image/jpeg',
          filename: 'photo1.jpg',
        },
      }
    }

    const result = handleLoggingMethodSelection(req, 'manual')

    expect(updateSessionData).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        photos: undefined,
        currentPhoto: undefined,
      }),
    )
    expect(result.redirectUrl).toBe('/log/application-details')
  })
})
