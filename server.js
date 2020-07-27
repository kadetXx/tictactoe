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
let connectedUsers = 0;

let resetBoard = [
  '','','',
  '','','',
  '','',''
]

// run when client connects
io.on('connection', socket => {
  connectedUsers++
  console.log(`Connected Users: ${connectedUsers}`);

  socket.on('joinRoom', ({username, room}) => {

    const user = game.userJoin(socket.id, username, room);
    let users = game.getRoomUsers(user.room);

    //add user to room
    socket.join(user.room);

    // send message to single user
    socket.emit('message', game.formatMsg(botName, `Welcome ${user.username}`, 'left'))

    // send message to all other users
    socket.broadcast.to(user.room).emit('message', game.formatMsg(botName, `${user.username} has joined`, 'left'));

    // set room admin
    io.to(users[0].id).emit('admin', true);
  

    // send room users info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: game.getRoomUsers(user.room),
    });
  })

  // listen for chat message
  socket.on('chatMessage', msg => {

    let user = game.getCurrentUser(socket.id);

    if (!user) {
      
      socket.emit('message', game.formatMsg(botName, 'Please reload 🙂', 'left'));
      socket.emit('reload', 'An error occured');

    } else { 
      let user = game.getCurrentUser(socket.id);
      let users = game.getRoomUsers(user.room);

      // show user their message
      if (socket.id == users[0].id) {
        socket.emit('message', game.formatMsg(`${user.username} (admin)`, msg, 'right'));
      } else {
        socket.emit('message', game.formatMsg(`${user.username}`, msg, 'right'));
      }
      

      //other users messages
      if (socket.id == users[0].id) {
        socket.broadcast.to(user.room).emit('message', game.formatMsg(`${user.username} (admin)`, msg, 'left'));
      } else {
        socket.broadcast.to(user.room).emit('message', game.formatMsg(`${user.username}`, msg, 'left'));
      }

    }
  })


  //call turn function 
  socket.on('entry', move => {

    let user = game.getCurrentUser(socket.id);

    //check if the server restarted
    if (!user) {
      
      socket.emit('reload', 'An error occured');

    } else {

      let users = game.getRoomUsers(user.room);
    
      //check if there is a second player to start game
      if (user.id == users[0].id && users[1]) {
        
        // disable double play 
        socket.emit('changeTurn', game.changeTurn(`${users[1].username}'s turn`, 'disable'));

        // allow second player to play
        io.to(users[1].id).emit('changeTurn', game.changeTurn(`Your turn`, 'enable'));
  
        // show user's move
        io.to(user.room).emit('entry', move);

      } else if (user.id == users[1].id) {

        // disable double play 
        socket.emit('changeTurn', game.changeTurn(`${users[0].username}'s turn`, 'disable'));

        // allow second player to play
        io.to(users[0].id).emit('changeTurn', game.changeTurn(`Your turn`, 'enable'));
  
        // show user's move
        io.to(user.room).emit('entry', move);

      } else if (!users[1]){

        // send bot message if there are no opponents
        socket.emit('message', game.formatMsg(botName, 'Hang on, someone will join soon 😇😇', 'left'));

      } else {

        // ward spectators not to touch the board
        socket.emit('message', game.formatMsg(botName, "Hand's off, you are spectating", 'left'));

      }
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

    io.to(user.room).emit('state-change', resetBoard);
    io.to(user.room).emit('gameOver', `${data} reload to play again`);
    io.to(user.room).emit('changeTurn', game.changeTurn('', 'disable'));
  })
  
  // handle disconnection
  socket.on('disconnect', () => {
    connectedUsers--

    // remove user from room and return user object
    const user = game.userLeaves(socket.id);

    if (user) {
      //notify members of leave
      io.to(user.room).emit('message', game.formatMsg(botName, `${user.username} just left`, 'left'));

      // get current room users
      let users = game.getRoomUsers(user.room);

      // set new admin
      if (users[0]) {
        io.to(users[0].id).emit('admin', true);
      }
      
      // send room users info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: users
      });
    }
  })
})

// set static folder 
app.use(express.static(path.join(__dirname, 'client')))

const PORT = process.env.PORT || 3000 ;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})