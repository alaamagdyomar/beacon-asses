export type Winner = 'X' | 'O' | 'Draw' | null;

export interface GameSummary {
  id: string;
  roomId: string;
  winner: Winner;
  createdAt: string;
}
