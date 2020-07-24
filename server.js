// setup server

const http = require('http');
const express = require('express'); 
const path = require('path');
const socketio = require('socket.io'); 
const game = require('./utils/game');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let botName = 'GameBot'

// run when client connects
io.on('connection', socket => {
  console.log('New connection...');

  socket.on('joinRoom', ({username, room}) => {

    const user = game.userJoin(socket.id, username, room);
    socket.join(user.room)


    // send message to single user
    socket.emit('message', game.formatMsg(botName, 'Welcome to the game', 'right'))

    // send message to all other users
    socket.broadcast.to(user.room).emit('message', game.formatMsg(botName, `${user.username} has joined`, 'left'))
  })

  // listen for chat message
  socket.on('chatMessage', msg => {
    const user = game.getCurrentUser(socket.id);

    socket.emit('message', game.formatMsg(`${user.username}`, msg, 'right'));
    socket.broadcast.to(user.room).emit('message', game.formatMsg(`${user.username}`, msg, 'left'))
  })

  // handle disconnection
  socket.on('disconnect', () => {

    const user = game.userLeaves(socket.id);

    if (user) {
      io.to(user.room).emit('message', game.formatMsg(botName, `${user.username} has left the chat`, 'left'))
    }
  })

  // send room users info
  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: game.getRoomUsers(user.room)
  })
})

// set static folder 
app.use(express.static(path.join(__dirname, 'client')))

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})