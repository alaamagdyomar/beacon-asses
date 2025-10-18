// server/src/socket/index.ts
import type { Server as IOServer, Socket } from "socket.io";
import { registerGameLogic } from "./logic";

export function registerSocketHandlers(io: IOServer) {
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);
    registerGameLogic(io, socket);
    socket.on("disconnect", () =>
      console.log(`🔴 Client disconnected: ${socket.id}`)
    );
  });
}
