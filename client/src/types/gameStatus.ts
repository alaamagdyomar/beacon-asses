type Role = 'X' | 'O';
type Winner = Role | 'Draw' | null;

export type GameStatus = {
  youAre: Role | null;
  next: Role | null;
  winner: Winner;
};
