import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";

import initApp from "./server";
import socketHandler from "./sockets/socketHandler";

const port = process.env.PORT || 3000;

initApp()
  .then((app) => {
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    socketHandler(io);

    server.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to initialize app:", error);
  });
