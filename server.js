// setup server

const http = require('http');
const express = require('express'); 
const path = require('path');
const socketio = require('socket.io'); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// run when client connects
io.on('connection', socket => {
  console.log('New connection...');

  // send message to single user
  socket.emit('message', ['Welcome to the game!', 'right'])

  // send message to all other users
  socket.broadcast.emit('message', ['A new user has joined!', 'left'])

  // handle disconnection
  socket.on('disconnect', () => {
    io.emit('message', ['A user has left the chat', 'left'])
  })

  // listen for chat message
  socket.on('chatMessage', msg => {
    socket.emit('message', [msg, 'right']);
    socket.broadcast.emit('message', [msg, 'left'])
  })
})

// set static folder 
app.use(express.static(path.join(__dirname, 'client')))

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})