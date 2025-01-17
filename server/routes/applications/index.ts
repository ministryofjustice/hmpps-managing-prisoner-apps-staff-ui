import { Router, Request, Response } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

const router = Router()

router.get(
  '/',
  asyncMiddleware(async (req: Request, res: Response) => {
    res.render('pages/applications', { title: 'Applications' })
  }),
)

export default router
