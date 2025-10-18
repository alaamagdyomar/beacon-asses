// server/src/socket/logic.ts
import type { Server as IOServer, Socket, RemoteSocket } from "socket.io";
import { prisma } from "../db/prisma";

// ───────────────────────────────────────────────────────────────────────────────
// Types & in-memory state
// ───────────────────────────────────────────────────────────────────────────────
type Role = "X" | "O";
type Cell = Role | null;
type Winner = Role | "Draw" | null;

type RoomState = {
  roomId: string;
  board: Cell[]; // length 9
  next: Role; // whose turn
  winner: Winner; // null until decided
  p1?: string; // socket.id of X
  p2?: string; // socket.id of O
};

const rooms = new Map<string, RoomState>();

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────
function freshBoard(): Cell[] {
  return Array<Cell>(9).fill(null);
}

function checkWinner(b: Cell[]): Winner {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diags
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every((c) => c !== null)) return "Draw";
  return null;
}

// Accept anything that has an id (Socket or RemoteSocket)
function buildGameStateFor(recipient: { id: string }, state: RoomState) {
  let youAre: Role | null = null;
  if (state.p1 === recipient.id) youAre = "X";
  if (state.p2 === recipient.id) youAre = "O";
  return {
    roomId: state.roomId,
    board: state.board,
    next: state.next,
    winner: state.winner,
    youAre, // client uses this to enable/disable the board
  };
}

// Fetch live socket ids currently in a room
async function getLiveIds(io: IOServer, roomId: string): Promise<Set<string>> {
  const sockets = await io.in(roomId).fetchSockets();
  return new Set<string>(sockets.map((s) => s.id));
}

// Remove seats that belong to sockets no longer connected
async function ensureSeats(io: IOServer, room: RoomState) {
  const live = await getLiveIds(io, room.roomId);
  if (room.p1 && !live.has(room.p1)) room.p1 = undefined;
  if (room.p2 && !live.has(room.p2)) room.p2 = undefined;
}

// Assign a seat to this socket (keep existing seat on rejoin)
function assignSeat(room: RoomState, socket: Socket): Role | null {
  if (room.p1 === socket.id) return "X"; // rejoin same socket (noop)
  if (room.p2 === socket.id) return "O"; // rejoin same socket (noop)

  if (!room.p1) {
    room.p1 = socket.id;
    return "X";
  }
  if (!room.p2) {
    room.p2 = socket.id;
    return "O";
  }
  return null; // full
}

// Broadcast to all live sockets in the room with role-aware state
async function broadcastRoom(io: IOServer, room: RoomState) {
  const sockets = await io.in(room.roomId).fetchSockets(); // RemoteSocket[]
  sockets.forEach((s: RemoteSocket<any, any>) => {
    s.emit("gameState", buildGameStateFor({ id: s.id }, room));
  });
}

// Free a seat held by this socket (on disconnect)
function freeSeat(room: RoomState, socketId: string) {
  if (room.p1 === socketId) room.p1 = undefined;
  if (room.p2 === socketId) room.p2 = undefined;
}

// ───────────────────────────────────────────────────────────────────────────────
// Public API: register per-socket game logic
// ───────────────────────────────────────────────────────────────────────────────
export function registerGameLogic(io: IOServer, socket: Socket) {
  // CREATE
  socket.on(
    "createRoom",
    async (
      _: unknown,
      cb: (res: {
        ok: boolean;
        roomId?: string;
        player?: Role;
        reason?: string;
      }) => void
    ) => {
      try {
        const roomId = "room-" + Math.random().toString(36).slice(2, 8);

        // persist initial game shell
        await prisma.game.create({
          data: { roomId, player1: "X" },
        });

        const room: RoomState = {
          roomId,
          board: freshBoard(),
          next: "X",
          winner: null,
          p1: socket.id,
        };
        rooms.set(roomId, room);
        socket.join(roomId);

        // send initial state to creator
        socket.emit("gameState", buildGameStateFor(socket, room));
        cb({ ok: true, roomId, player: "X" });
      } catch (e) {
        console.error("createRoom failed", e);
        cb({ ok: false, reason: "Server error" });
      }
    }
  );

  // JOIN (robust: cleans stale seats, supports rejoin, assigns first free seat)
  socket.on(
    "joinRoom",
    async (
      payload: { roomId: string },
      cb: (res: { ok: boolean; player?: Role; reason?: string }) => void
    ) => {
      try {
        const room = rooms.get(payload.roomId);
        if (!room) return cb({ ok: false, reason: "Room not found" });

        // 1) Clean up stale seats
        await ensureSeats(io, room);

        // 2) Assign seat (preserve seat if this is a rejoin)
        const assigned = assignSeat(room, socket);
        if (!assigned) return cb({ ok: false, reason: "Room is full" });

        // 3) Persist seat to DB
        const existing = await prisma.game.findUnique({
          where: { roomId: room.roomId },
        });
        if (existing) {
          await prisma.game.update({
            where: { id: existing.id },
            data: assigned === "X" ? { player1: "X" } : { player2: "O" },
          });
        } else {
          await prisma.game.create({
            data: {
              roomId: room.roomId,
              player1: assigned === "X" ? "X" : undefined,
              player2: assigned === "O" ? "O" : undefined,
            },
          });
        }

        // 4) Join room & broadcast
        socket.join(room.roomId);
        await broadcastRoom(io, room);

        // 5) Ack
        cb({ ok: true, player: assigned });
      } catch (e) {
        console.error("joinRoom failed", e);
        cb({ ok: false, reason: "Server error" });
      }
    }
  );

  // MOVE
  socket.on(
    "playerMove",
    async (data: { roomId: string; cellIndex: number; player: Role }) => {
      try {
        const room = rooms.get(data.roomId);
        if (!room) return socket.emit("errorMessage", "Room not found");
        if (room.winner) return; // ignore after game ended

        // validate sender
        const myRole: Role | null =
          room.p1 === socket.id ? "X" : room.p2 === socket.id ? "O" : null;
        if (!myRole || myRole !== data.player) return; // sender must match claimed role
        if (room.next !== data.player) return; // must be your turn
        if (room.board[data.cellIndex] !== null) return; // already taken

        // apply
        room.board[data.cellIndex] = data.player;
        const w = checkWinner(room.board);
        room.winner = w;
        if (!w) room.next = data.player === "X" ? "O" : "X";

        // persist move (+winner if any)
        const game = await prisma.game.findUnique({
          where: { roomId: room.roomId },
        });
        if (game) {
          await prisma.move.create({
            data: {
              gameId: game.id,
              index: data.cellIndex,
              player: data.player,
            },
          });
          if (w) {
            await prisma.game.update({
              where: { id: game.id },
              data: { winner: w },
            });
            io.emit("gameListUpdated");
          }
        }

        // broadcast
        await broadcastRoom(io, room);
      } catch (e) {
        console.error("playerMove failed", e);
        socket.emit("errorMessage", "Server error processing move");
      }
    }
  );

  // DISCONNECT → free any seat this socket held
  socket.on("disconnect", () => {
    let touched = false;
    for (const room of rooms.values()) {
      if (room.p1 === socket.id || room.p2 === socket.id) {
        freeSeat(room, socket.id);
        touched = true;
      }
    }
    if (touched) {
      // optional: you could broadcast new state so spectators see who's gone
      // (not required for 2-player play; uncomment if you need it)
      // rooms.forEach(async (r) => await broadcastRoom(io, r));
    }
  });
}
