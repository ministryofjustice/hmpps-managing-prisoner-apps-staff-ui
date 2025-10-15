import type { Request, Response, NextFunction } from 'express'

export default function gaMiddleware(req: Request, res: Response, next: NextFunction) {
  const isProd = process.env.NODE_ENV === 'production'
  const isHomepage = req.path === '/'

  res.locals.includeGA = !isProd || (isProd && isHomepage)

  next()
}
