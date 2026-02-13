import { Request } from 'express'
import { PHOTO_KEYS } from '../constants/photos'
import { URLS } from '../constants/urls'
import { getBackLink, resetSecondPhotoIfExists, createPhotoFromFile } from './photos'

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
})
