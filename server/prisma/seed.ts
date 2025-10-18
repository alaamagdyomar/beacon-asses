// Optional seed; run with: npm run seed
import { prisma } from "../src/db/prisma";

async function main() {
  await prisma.game.createMany({
    data: [
      { player1: "p1", player2: "p2", winner: "Player 1" },
      { player1: "a", player2: "b", winner: "Draw" },
    ],
  });
  console.log("Seeded sample games");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
