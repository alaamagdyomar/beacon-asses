import { Router } from 'express'
import { prisma } from '../db/prisma'

const router = Router()

router.get('/games', async (_req, res) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(games)
  } catch (e) {
    console.error('GET /api/games failed:', e)
    res.status(500).json({ error: 'Failed to load games' })
  }
})

export default router
