import { io } from "socket.io-client";
const URL = import.meta.env.VITE_API_URL;
export const socket = io(URL, { transports: ["websocket"] });

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err);
});