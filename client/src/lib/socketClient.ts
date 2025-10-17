import { io } from "socket.io-client";
import { SOCKET_URL } from "@app/config/env";
export const socket = io(SOCKET_URL, { transports: ["websocket"] });