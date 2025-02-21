import { WebSocketServer } from "ws";
import express from "express";
import http from "http";

const PORT = process.env.PORT || 10001; // Use Render-assigned port if available
const app = express();
const server = http.createServer(app);

// Create WebSocket Server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔗 WebSocket Client Connected.");

  ws.on("message", (message) => {
    console.log("📩 Received:", message.toString());
  });

  ws.on("close", () => {
    console.log("❌ Client Disconnected.");
  });
});

// Start HTTP Server & Upgrade WebSocket Connections
server.listen(PORT, () => {
  const wsUrl = process.env.RENDER_EXTERNAL_URL
    ? `wss://${process.env.RENDER_EXTERNAL_URL.replace(/^https?:\/\//, "")}`
    : `ws://localhost:${PORT}`;
  
  console.log(`📡 WebSocket Server running on ${wsUrl}`);
});