import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import gamesRouter from "./routes/games";
import { registerSocketHandlers } from "./socket/index";

// ───────────────────────────────
// 1️⃣  Express App Setup
// ───────────────────────────────
const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
// Allow JSON requests and CORS (for local frontend)
app.use(cors({ origin: clientOrigin || "http://localhost:5173" }));
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => res.json({ ok: true }));

// REST API routes
app.use("/api", gamesRouter);

// ───────────────────────────────
// 2️⃣  HTTP + Socket.IO Setup
// ───────────────────────────────
const server = http.createServer(app);

const io = new IOServer(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" },
});

// Register all socket event handlers (kept modular)
registerSocketHandlers(io);

// ───────────────────────────────
// 3️⃣  Server Startup
// ───────────────────────────────
const port = Number(process.env.PORT) || 4000;

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🌐 CORS origin: ${clientOrigin}`);
});
