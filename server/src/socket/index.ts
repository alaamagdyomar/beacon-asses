import { Server as IOServer } from "socket.io";
import { emptyBoard, checkWinner, nextPlayer } from "./logic";
import { Board, Player, RoomState } from "../types/socket";

const rooms = new Map<string, RoomState>();

function createRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Register all realtime handlers.
 * Events (client ⇄ server):
 * - createRoom({ preferred? }, cb)  -> cb({ roomId, player })
 * - joinRoom({ roomId }, cb)        -> cb({ ok, player? | reason })
 * - playerMove({ roomId, cellIndex, player })
 * Server emits: gameState({ roomId, board, next, winner? }) and error({ message })
 */
export function registerSocketHandlers(io: IOServer) {
  io.on("connection", (socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    // CREATE ROOM
    socket.on(
      "createRoom",
      (
        payload: { preferred?: Player } = {},
        cb: (res: { roomId: string; player: Player }) => void
      ) => {
        const roomId = createRoomId();
        const starter: Player = payload.preferred ?? "X";

        rooms.set(roomId, {
          board: emptyBoard(),
          next: "X",
          players: { [starter]: socket.id },
        });

        socket.join(roomId);
        cb({ roomId, player: starter });

        const s = rooms.get(roomId)!;
        io.to(roomId).emit("gameState", {
          roomId,
          board: s.board,
          next: s.next,
          winner: s.winner,
        });
        console.log(`🏠 Room created ${roomId} | ${starter}=${socket.id}`);
      }
    );

    // JOIN ROOM
    socket.on(
      "joinRoom",
      (
        payload: { roomId: string },
        cb: (
          res: { ok: true; player: Player } | { ok: false; reason: string }
        ) => void
      ) => {
        const { roomId } = payload || {};
        const s = roomId ? rooms.get(roomId) : undefined;
        if (!s) {
          cb({ ok: false, reason: "Room not found" });
          return;
        }

        // assign remaining role
        const role: Player = !s.players["X"]
          ? "X"
          : !s.players["O"]
          ? "O"
          : (null as any);
        if (!role) {
          cb({ ok: false, reason: "Room full" });
          return;
        }

        s.players[role] = socket.id;
        socket.join(roomId);
        cb({ ok: true, player: role });

        io.to(roomId).emit("gameState", {
          roomId,
          board: s.board,
          next: s.next,
          winner: s.winner,
        });
        console.log(`👥 ${socket.id} joined room ${roomId} as ${role}`);
      }
    );

    // PLAYER MOVE
    socket.on(
      "playerMove",
      (payload: { roomId: string; cellIndex: number; player: Player }) => {
        const { roomId, cellIndex, player } = payload || ({} as any);
        const s = roomId ? rooms.get(roomId) : undefined;
        if (!s) return socket.emit("error", { message: "Room not found" });
        if (s.winner) return; // game already ended
        if (s.next !== player) return; // not your turn
        if (cellIndex < 0 || cellIndex > 8) return; // invalid index
        if (s.board[cellIndex]) return; // cell occupied

        s.board[cellIndex] = player;

        const win = checkWinner(s.board);
        if (win) {
          s.winner = win;
          // @ts-expect-error allow null to indicate no next turn
          s.next = null;
        } else {
          s.next = nextPlayer(player);
        }

        io.to(roomId).emit("gameState", {
          roomId,
          board: s.board,
          next: s.next,
          winner: s.winner,
        });
        console.log(
          `🎯 move @${roomId}: ${player} -> ${cellIndex} | next=${
            s.next ?? "—"
          } | winner=${s.winner ?? "—"}`
        );
      }
    );

    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
      // light cleanup: detach players, optionally delete finished empty rooms
      for (const [roomId, s] of rooms) {
        if (s.players["X"] === socket.id) s.players["X"] = undefined;
        if (s.players["O"] === socket.id) s.players["O"] = undefined;
        if (!s.players["X"] && !s.players["O"] && s.winner) {
          rooms.delete(roomId);
          console.log(`🧹 removed finished empty room ${roomId}`);
        }
      }
    });
  });
}
