export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type RoomState = {
  board: Board;
  next: Player;
  players: Partial<Record<Player, string>>; // socket.id by role
  winner?: Player | "Draw";
};

export type ClientToServerEvents = {
  createRoom: (
    payload: { preferred?: Player },
    cb: (res: { roomId: string; player: Player }) => void
  ) => void;

  joinRoom: (
    payload: { roomId: string },
    cb: (
      res: { ok: true; player: Player } | { ok: false; reason: string }
    ) => void
  ) => void;

  playerMove: (payload: {
    roomId: string;
    cellIndex: number;
    player: Player;
  }) => void;
};

export type ServerToClientEvents = {
  gameState: (state: {
    roomId: string;
    board: Board;
    next: Player | null;
    winner?: Player | "Draw";
  }) => void;
  error: (payload: { message: string }) => void;
};
