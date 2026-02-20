import { Request } from 'express'
import { ApplicationData } from 'express-session'
import { PHOTO_KEYS } from '../constants/photos'
import { URLS } from '../constants/urls'
import { updateSessionData } from '../utils/http/session'
import {
  getBackLink,
  resetSecondPhotoIfExists,
  createPhotoFromFile,
  handlePhotoQueryParams,
  getPhotosForDisplay,
} from './photos'

jest.mock('../utils/http/session', () => ({
  updateSessionData: jest.fn(),
}))

type MockApplicationData = {
  photos?: Record<string, unknown>
  currentPhoto?: string
  addAnotherPhoto?: string | null
  prisonerName?: string
  department?: string
}

describe('Photo Helpers', () => {
  describe('getBackLink', () => {
    const createMockRequest = (path: string, applicationData?: MockApplicationData): Partial<Request> => ({
      path,
      session: {
        applicationData,
      } as Request['session'],
    })

    it('should return LOG_METHOD when applicationData is undefined', () => {
      const req = createMockRequest(URLS.LOG_PHOTO_CAPTURE)
      expect(getBackLink(req as Request)).toBe(URLS.LOG_METHOD)
    })

    describe('LOG_ADDITIONAL_PHOTO_DETAILS path', () => {
      it('should return LOG_CONFIRM_PHOTO_CAPTURE when photoCount >= MAX_PHOTOS', () => {
        const req = createMockRequest(URLS.LOG_ADDITIONAL_PHOTO_DETAILS, {
          photos: { photo1: {}, photo2: {} },
        })
        expect(getBackLink(req as Request)).toBe(URLS.LOG_CONFIRM_PHOTO_CAPTURE)
      })

      it('should return LOG_ADD_ANOTHER_PHOTO when photoCount < MAX_PHOTOS', () => {
        const req = createMockRequest(URLS.LOG_ADDITIONAL_PHOTO_DETAILS, {
          photos: { photo1: {} },
        })
        expect(getBackLink(req as Request)).toBe(URLS.LOG_ADD_ANOTHER_PHOTO)
      })
    })

    describe('LOG_ADD_ANOTHER_PHOTO path', () => {
      it('should return LOG_CONFIRM_PHOTO_CAPTURE', () => {
        const req = createMockRequest(URLS.LOG_ADD_ANOTHER_PHOTO, {})
        expect(getBackLink(req as Request)).toBe(URLS.LOG_CONFIRM_PHOTO_CAPTURE)
      })
    })

    describe('LOG_CONFIRM_PHOTO_CAPTURE path', () => {
      it('should return LOG_PHOTO_CAPTURE', () => {
        const req = createMockRequest(URLS.LOG_CONFIRM_PHOTO_CAPTURE, {})
        expect(getBackLink(req as Request)).toBe(URLS.LOG_PHOTO_CAPTURE)
      })
    })

    describe('LOG_PHOTO_CAPTURE path', () => {
      it('should return LOG_ADD_ANOTHER_PHOTO when currentPhoto is PHOTO_2', () => {
        const req = createMockRequest(URLS.LOG_PHOTO_CAPTURE, {
          currentPhoto: PHOTO_KEYS.PHOTO_2,
        })
        expect(getBackLink(req as Request)).toBe(URLS.LOG_ADD_ANOTHER_PHOTO)
      })

      it('should return LOG_METHOD when currentPhoto is PHOTO_1', () => {
        const req = createMockRequest(URLS.LOG_PHOTO_CAPTURE, {
          currentPhoto: PHOTO_KEYS.PHOTO_1,
        })
        expect(getBackLink(req as Request)).toBe(URLS.LOG_METHOD)
      })

      it('should return LOG_METHOD when currentPhoto is undefined (defaults to PHOTO_1)', () => {
        const req = createMockRequest(URLS.LOG_PHOTO_CAPTURE, {})
        expect(getBackLink(req as Request)).toBe(URLS.LOG_METHOD)
      })
    })

    describe('default/unknown path', () => {
      it('should return LOG_METHOD for unknown paths', () => {
        const req = createMockRequest('/some/unknown/path', {})
        expect(getBackLink(req as Request)).toBe(URLS.LOG_METHOD)
      })
    })
  })

  describe('resetSecondPhotoIfExists', () => {
    it('should do nothing if applicationData is undefined', () => {
      const req = {
        session: {},
      } as Request

      resetSecondPhotoIfExists(req)

      expect(req.session.applicationData).toBeUndefined()
    })

    it('should do nothing if photo2 does not exist', () => {
      const req = {
        session: {
          applicationData: {
            photos: { photo1: {} },
            currentPhoto: PHOTO_KEYS.PHOTO_1,
          },
        },
      } as Request

      resetSecondPhotoIfExists(req)

      expect(req.session.applicationData?.photos).toEqual({ photo1: {} })
      expect(req.session.applicationData?.currentPhoto).toBe(PHOTO_KEYS.PHOTO_1)
    })

    it('should delete photo2 and reset state when photo2 exists', () => {
      const req = {
        session: {
          applicationData: {
            photos: { photo1: { buffer: 'data1' }, photo2: { buffer: 'data2' } },
            currentPhoto: PHOTO_KEYS.PHOTO_2,
            addAnotherPhoto: 'yes',
          },
        },
      } as unknown as Request

      resetSecondPhotoIfExists(req)

      expect(req.session.applicationData?.photos?.photo2).toBeUndefined()
      expect(req.session.applicationData?.photos?.photo1).toBeDefined()
      expect(req.session.applicationData?.currentPhoto).toBe(PHOTO_KEYS.PHOTO_1)
      expect(req.session.applicationData?.addAnotherPhoto).toBeNull()
    })

    it('should preserve other applicationData properties', () => {
      const req = {
        session: {
          applicationData: {
            photos: { photo1: {}, photo2: {} },
            currentPhoto: PHOTO_KEYS.PHOTO_2,
            prisonerName: 'John Doe',
            department: 'Business Hub',
          },
        },
      } as Request

      resetSecondPhotoIfExists(req)

      expect(req.session.applicationData?.prisonerName).toBe('John Doe')
      expect(req.session.applicationData?.department).toBe('Business Hub')
    })
  })

  describe('createPhotoFromFile', () => {
    it('should create photo object from file with currentPhoto key', () => {
      const mockFile = {
        buffer: Buffer.from('test-image-data'),
        mimetype: 'image/jpeg',
        originalname: 'test-photo.jpg',
      } as Express.Multer.File

      const result = createPhotoFromFile(mockFile, PHOTO_KEYS.PHOTO_1)

      expect(result).toEqual({
        buffer: mockFile.buffer,
        mimetype: 'image/jpeg',
        filename: 'test-photo[photo1].jpg',
      })
    })

    it('should create photo object for PHOTO_2', () => {
      const mockFile = {
        buffer: Buffer.from('test-image-data'),
        mimetype: 'image/png',
        originalname: 'application.png',
      } as Express.Multer.File

      const result = createPhotoFromFile(mockFile, PHOTO_KEYS.PHOTO_2)

      expect(result).toEqual({
        buffer: mockFile.buffer,
        mimetype: 'image/png',
        filename: 'application[photo2].png',
      })
    })

    it('should handle files with multiple dots in name', () => {
      const mockFile = {
        buffer: Buffer.from('test-data'),
        mimetype: 'image/jpeg',
        originalname: 'my.test.photo.jpg',
      } as Express.Multer.File

      const result = createPhotoFromFile(mockFile, PHOTO_KEYS.PHOTO_1)

      expect(result.filename).toBe('my.test.photo[photo1].jpg')
    })

    it('should preserve buffer data', () => {
      const testBuffer = Buffer.from('important-image-data')
      const mockFile = {
        buffer: testBuffer,
        mimetype: 'image/webp',
        originalname: 'photo.webp',
      } as Express.Multer.File

      const result = createPhotoFromFile(mockFile, PHOTO_KEYS.PHOTO_1)

      expect(result.buffer).toBe(testBuffer)
      expect(result.buffer.toString()).toBe('important-image-data')
    })
  })

  describe('handlePhotoQueryParams', () => {
    let req: Partial<Request>

    beforeEach(() => {
      req = { session: { applicationData: {} } as Request['session'] }
      ;(updateSessionData as jest.Mock).mockClear()
    })

    it('defaults to PHOTO_1 if no query', () => {
      handlePhotoQueryParams(req as Request)
      expect(updateSessionData).toHaveBeenCalledWith(req, {
        currentPhoto: PHOTO_KEYS.PHOTO_1,
      })
    })

    it('handles retake PHOTO_1', () => {
      handlePhotoQueryParams(req as Request, PHOTO_KEYS.PHOTO_1)
      expect(updateSessionData).toHaveBeenCalledWith(req, {
        currentPhoto: PHOTO_KEYS.PHOTO_1,
        isFromCheckDetailsPage: true,
      })
    })

    it('handles retake PHOTO_2', () => {
      handlePhotoQueryParams(req as Request, PHOTO_KEYS.PHOTO_2)
      expect(updateSessionData).toHaveBeenCalledWith(req, {
        currentPhoto: PHOTO_KEYS.PHOTO_2,
        isFromCheckDetailsPage: true,
      })
    })

    it('handles image query "1"', () => {
      handlePhotoQueryParams(req as Request, undefined, '1')
      expect(updateSessionData).toHaveBeenCalledWith(req, {
        currentPhoto: PHOTO_KEYS.PHOTO_1,
        isFromCheckDetailsPage: true,
      })
    })

    it('handles image query "2"', () => {
      handlePhotoQueryParams(req as Request, undefined, '2')
      expect(updateSessionData).toHaveBeenCalledWith(req, {
        currentPhoto: PHOTO_KEYS.PHOTO_2,
        isFromCheckDetailsPage: true,
      })
    })
  })
  describe('getPhotosForDisplay', () => {
    it('should return empty data when applicationData is undefined', () => {
      const result = getPhotosForDisplay(undefined as unknown as ApplicationData)

      expect(result).toEqual({
        photosForDisplay: undefined,
        photoDetails: undefined,
        hasNoPhotos: false,
      })
    })

    it('should return empty data when loggingMethod is not webcam', () => {
      const applicationData: ApplicationData = {
        loggingMethod: 'manual',
      }

      const result = getPhotosForDisplay(applicationData)

      expect(result).toEqual({
        photosForDisplay: undefined,
        photoDetails: undefined,
        hasNoPhotos: false,
      })
    })

    it('should return empty data when loggingMethod is undefined', () => {
      const applicationData: ApplicationData = {}

      const result = getPhotosForDisplay(applicationData)

      expect(result).toEqual({
        photosForDisplay: undefined,
        photoDetails: undefined,
        hasNoPhotos: false,
      })
    })

    it('should return hasNoPhotos true when webcam method but no photos exist', () => {
      const applicationData: ApplicationData = {
        loggingMethod: 'webcam',
        photos: {},
      }

      const result = getPhotosForDisplay(applicationData)

      expect(result).toEqual({
        photosForDisplay: {},
        photoDetails: undefined,
        hasNoPhotos: true,
      })
    })

    it('should convert single photo to display format with base64 imgSrc', () => {
      const photoBuffer = Buffer.from('test-image-data')
      const applicationData: ApplicationData = {
        loggingMethod: 'webcam',
        photos: {
          photo1: {
            buffer: photoBuffer,
            mimetype: 'image/jpeg',
            filename: 'test-photo[photo1].jpg',
          },
        },
        photoAdditionalDetails: 'Test details',
      }

      const result = getPhotosForDisplay(applicationData)

      expect(result.hasNoPhotos).toBe(false)
      expect(result.photoDetails).toBe('Test details')
      expect(result.photosForDisplay).toBeDefined()
      expect(result.photosForDisplay?.photo1).toEqual({
        buffer: photoBuffer,
        mimetype: 'image/jpeg',
        filename: 'test-photo[photo1].jpg',
        imgSrc: `data:image/jpeg;base64,${photoBuffer.toString('base64')}`,
      })
    })

    it('should convert multiple photos to display format', () => {
      const photo1Buffer = Buffer.from('photo1-data')
      const photo2Buffer = Buffer.from('photo2-data')
      const applicationData: ApplicationData = {
        loggingMethod: 'webcam',
        photos: {
          photo1: {
            buffer: photo1Buffer,
            mimetype: 'image/jpeg',
            filename: 'app[photo1].jpg',
          },
          photo2: {
            buffer: photo2Buffer,
            mimetype: 'image/png',
            filename: 'app[photo2].png',
          },
        },
        photoAdditionalDetails: 'Additional info',
      }

      const result = getPhotosForDisplay(applicationData)

      expect(result.hasNoPhotos).toBe(false)
      expect(result.photoDetails).toBe('Additional info')
      expect(result.photosForDisplay).toBeDefined()
      expect(Object.keys(result.photosForDisplay!)).toHaveLength(2)

      expect(result.photosForDisplay?.photo1).toEqual({
        buffer: photo1Buffer,
        mimetype: 'image/jpeg',
        filename: 'app[photo1].jpg',
        imgSrc: `data:image/jpeg;base64,${photo1Buffer.toString('base64')}`,
      })

      expect(result.photosForDisplay?.photo2).toEqual({
        buffer: photo2Buffer,
        mimetype: 'image/png',
        filename: 'app[photo2].png',
        imgSrc: `data:image/png;base64,${photo2Buffer.toString('base64')}`,
      })
    })

    it('should handle photos without photoAdditionalDetails', () => {
      const photoBuffer = Buffer.from('test-data')
      const applicationData: ApplicationData = {
        loggingMethod: 'webcam',
        photos: {
          photo1: {
            buffer: photoBuffer,
            mimetype: 'image/webp',
            filename: 'photo[photo1].webp',
          },
        },
      }

      const result = getPhotosForDisplay(applicationData)

      expect(result.hasNoPhotos).toBe(false)
      expect(result.photoDetails).toBeUndefined()
      expect(result.photosForDisplay?.photo1.imgSrc).toBe(`data:image/webp;base64,${photoBuffer.toString('base64')}`)
    })

    it('should preserve original photo properties', () => {
      const photoBuffer = Buffer.from('original-data')
      const applicationData: ApplicationData = {
        loggingMethod: 'webcam',
        photos: {
          photo1: {
            buffer: photoBuffer,
            mimetype: 'image/gif',
            filename: 'original[photo1].gif',
          },
        },
      }

      const result = getPhotosForDisplay(applicationData)

      expect(result.photosForDisplay?.photo1.buffer).toBe(photoBuffer)
      expect(result.photosForDisplay?.photo1.mimetype).toBe('image/gif')
      expect(result.photosForDisplay?.photo1.filename).toBe('original[photo1].gif')
    })

    it('should handle different image mimetypes correctly', () => {
      const photoBuffer = Buffer.from('image-data')
      const mimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']

      mimetypes.forEach(mimetype => {
        const applicationData: ApplicationData = {
          loggingMethod: 'webcam',
          photos: {
            photo1: {
              buffer: photoBuffer,
              mimetype,
              filename: 'test[photo1].jpg',
            },
          },
        }

        const result = getPhotosForDisplay(applicationData)

        expect(result.photosForDisplay?.photo1.imgSrc).toBe(`data:${mimetype};base64,${photoBuffer.toString('base64')}`)
      })
    })
  })
})
