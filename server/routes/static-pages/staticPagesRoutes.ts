import { Router } from 'express'

export default function staticPagesRoutes(): Router {
  const router = Router()

  router.get('/accessibility-statement', (req, res) => {
    res.render('pages/static-pages/accessibility-statement')
  })
  return router
}
