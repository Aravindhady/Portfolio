const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const users = new Map();
const messages = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user connection
  socket.on('user-connect', (userData) => {
    users.set(socket.id, {
      socketId: socket.id,
      name: userData.username,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      pos: { x: 0, y: 0 },
      location: 'home',
      flag: 'us'
    });
    io.emit('users-update', Array.from(users.values()));
  });

  // Handle messages
  socket.on('msg-send', (msg) => {
    const user = users.get(socket.id);
    if (user) {
      const message = {
        socketId: socket.id,
        content: msg.content,
        time: new Date(),
        username: user.name
      };
      messages.push(message);
      io.emit('msg-receive', message);
    }
  });

  // Handle username changes
  socket.on('username-change', (data) => {
    const user = users.get(socket.id);
    if (user) {
      user.name = data.username;
      users.set(socket.id, user);
      io.emit('users-update', Array.from(users.values()));
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);
    io.emit('users-update', Array.from(users.values()));
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 