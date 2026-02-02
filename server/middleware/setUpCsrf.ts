import { Router } from 'express'
import { csrfSync } from 'csrf-sync'
import { URLS } from '../constants/urls'

const testMode = process.env.NODE_ENV === 'test'

export default function setUpCsrf(): Router {
  const router = Router({ mergeParams: true })

  // CSRF protection
  if (!testMode) {
    const {
      csrfSynchronisedProtection, // This is the default CSRF protection middleware.
    } = csrfSync({
      // By default, csrf-sync uses x-csrf-token header, but we use the token in forms and send it in the request body, so change getTokenFromRequest so it grabs from there
      getTokenFromRequest: req => {
        // eslint-disable-next-line no-underscore-dangle
        return req.body._csrf
      },
    })

    // Skip CSRF for routes that use multer (they handle CSRF after parsing multipart data)
    router.use((req, res, next) => {
      if (
        (req.path === URLS.LOG_PHOTO_CAPTURE && req.method === 'POST') ||
        (req.path === URLS.LOG_CONFIRM_PHOTO_CAPTURE && req.method === 'POST')
      ) {
        return next() // Skip global CSRF, route has its own after multer
      }
      return csrfSynchronisedProtection(req, res, next)
    })
  }

  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  return router
}
