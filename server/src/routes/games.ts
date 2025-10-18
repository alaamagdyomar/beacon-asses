import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/games", async (_req, res) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, roomId: true, winner: true, createdAt: true },
    });
    res.json(games);
  } catch (e) {
    console.error("GET /api/games failed:", e);
    res.status(500).json({ error: "Failed to load games" });
  }
});

// NEW: details with moves
router.get("/games/:id", async (req, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      include: { moves: { orderBy: { createdAt: "asc" } } },
    });
    if (!game) return res.status(404).json({ error: "Not found" });
    res.json(game);
  } catch (e) {
    console.error("GET /api/games/:id failed:", e);
    res.status(500).json({ error: "Failed to load game" });
  }
});

export default router;
