const express = require('express');
const http = require('http');
const cors = require('cors')

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"]
  }
});

app.use(cors());
const PORT = process.env.PORT || 5050;
app.get('/', (req, res) => {
      res.send('Hello World');
});

const rooms = {};
let currentRoom;
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle room creation
  socket.on('createRoom', (roomId, username) => {
    console.log(' username: ' ,username);
    currentRoom = roomId;
    if(!rooms[roomId]){
      rooms[roomId] = { users: {} };
    }
    // Add the user to the users object
    rooms[roomId].users[socket.id] = { username: username, socketId: socket.id }; 
    socket.join(roomId);
    io.to(roomId).emit('updateUserList', Object.values(rooms[roomId].users));
  });

    // Handle joining a room
    socket.on('joinRoom', (roomId) => {
      currentRoom = roomId;
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });
  

  socket.on('leaveRoom', () => {
    if (currentRoom) {
      socket.leave(currentRoom);
      console.log(`User ${socket.id} left room: ${currentRoom}`);
      // Clean up user from the current room
      delete rooms[currentRoom].users[socket.id];
      io.to(currentRoom).emit('userLeft', socket.id);
      io.to(currentRoom).emit('updateUserList', Object.values(rooms[currentRoom].users));
      currentRoom = null;
      console.log('test leave');
    }
  });

  socket.on('sendMessage', ({ roomId, message, userName }) => {
     io.to(roomId).emit('message', { user: userName, message });
    console.log('in send message');
  });

  socket.on('privateMessage', ({ senderId, recipientId, message, username }) => {
    io.to(recipientId).emit('privateMessage', { senderId, message, username });
  });




  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up user from rooms
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        delete rooms[roomId].users[socket.id];
        io.to(roomId).emit('userLeft', socket.id);
        io.to(currentRoom).emit('updateUserList', Object.values(rooms[currentRoom].users));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
