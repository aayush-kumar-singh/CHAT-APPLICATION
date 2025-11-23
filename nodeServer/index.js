// nodeServer/index.js

const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Render will give PORT in env, use 8000 locally
const port = process.env.PORT || 8000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("new-user-joined", (name) => {
    console.log("New user", name);
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit("left", name);
      delete users[socket.id];
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
