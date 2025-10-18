import { Board, Player } from "../types/socket";

export function emptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

export function checkWinner(board: Board): Player | "Draw" | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) return v;
  }
  return board.every(Boolean) ? "Draw" : null;
}

export function nextPlayer(p: Player): Player {
  return p === "X" ? "O" : "X";
}
