const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { initializeSocket } = require("./utils/initializeSocket");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: `${process.env.CLIENT_URL}`,
    origin: "*",
  },
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`server is running on ${PORT}...`);
});

initializeSocket(io);
