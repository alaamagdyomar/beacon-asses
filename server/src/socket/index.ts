import { Server as IOServer, Socket } from "socket.io";

export function registerSocketHandlers(io: IOServer) {
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    // Player joins a game room
    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(`👥 ${socket.id} joined room ${roomId}`);
    });

    // Player makes a move
    socket.on("playerMove", (data) => {
      // data = { roomId, cellIndex, player }
      socket.to(data.roomId).emit("playerMove", data);
    });

    // Game ends
    socket.on("gameOver", async (result) => {
      // result = { player1, player2, winner }
      console.log(`🏁 Game finished: ${result.winner}`);
      io.emit("gameListUpdated"); // notify all clients to refresh /api/games
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });
}
