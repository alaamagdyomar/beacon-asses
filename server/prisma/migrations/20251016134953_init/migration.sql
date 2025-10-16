-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "player1" TEXT,
    "player2" TEXT,
    "winner" TEXT,
    "moves" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);
