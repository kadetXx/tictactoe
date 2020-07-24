// setup server

const http = require('http');
const express = require('express'); 
const path = require('path');
const socketio = require('socket.io'); 
const game = require('./utils/game');
// const { turns } = require('./utils/game');

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
    socket.emit('message', game.formatMsg(botName, `Welcome ${user.username}`, 'right'))

    // send message to all other users
    socket.broadcast.to(user.room).emit('message', game.formatMsg(botName, `${user.username} just sneaked in`, 'left'));

    // send room users info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: game.getRoomUsers(user.room),
    });
  })

  // listen for chat message
  socket.on('chatMessage', msg => {
    let user = game.getCurrentUser(socket.id);
    socket.emit('message', game.formatMsg(`${user.username}`, msg, 'right'));
    socket.broadcast.to(user.room).emit('message', game.formatMsg(`${user.username}`, msg, 'left'));
  })


  //call turn function 
  socket.on('entry', move => {
    let user = game.getCurrentUser(socket.id);
    let users = game.getRoomUsers(user.room);
    
    if (user.username == users[0].username && users[1].username) {
      socket.emit('changeTurn', game.changeTurn(users[1].username, 'disable'));
      socket.broadcast.to(user.room).emit('changeTurn', game.changeTurn(users[1].username, 'enable'));

      io.to(user.room).emit('entry', [move, 'X']);
    } else if (user.username == users[1].username) {
      socket.emit('changeTurn', game.changeTurn(users[0].username, 'disable'));
      socket.broadcast.to(user.room).emit('changeTurn', game.changeTurn(users[1].username, 'enable'));
      io.to(user.room).emit('entry', [move, 'O']);
    }
  })


  // state change
  socket.on('state-change', combinations => {
    let user = game.getCurrentUser(socket.id);
    let users = game.getRoomUsers(user.room);

    if (user.username == users[0].username || user.username == users[1].username) {
      io.to(user.room).emit('state-change', [...combinations]);
    }
  })

  //game over
  socket.on('gameOver', data => {

    let user = game.getCurrentUser(socket.id);
    let users = game.getRoomUsers(user.room);
 
    io.to(user.room).emit('gameOver', `${data} reload to play again`);
    io.to(user.room).emit('changeTurn', game.changeTurn('', 'disable'));
  })
  
  // handle disconnection
  socket.on('disconnect', () => {

    const user = game.userLeaves(socket.id);

    if (user) {
      io.to(user.room).emit('message', game.formatMsg(botName, `${user.username} has left the room`, 'left'));
      // send room users info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: game.getRoomUsers(user.room),
      });
    }
  })
})

// set static folder 
app.use(express.static(path.join(__dirname, 'client')))

const PORT = process.env.PORT || 3000 ;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})