// get username and room from homepage
let { username, room  } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// join chatroom 
socket.emit('joinRoom',  {username, room})

// show init message 
socket.on('message', message => {
  let msgBox = document.querySelector('#chat-messages div');

  let msg = document.createElement('div');
  msg.className = message.position
  msg.innerHTML = `<small>${message.username}</small><p>${message.text}</p>`;

  msgBox.appendChild(msg);
})

// allow users send messages
let form = document.querySelector('#chat');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  e.target.elements.msg.value = ''
  socket.emit('chatMessage', msg);
})

// get room name and users
socket.on('roomUsers', ({room, users}) => {
  showName(room);
  showUsers(users);
})

// output room name
function showName(name) {
  let roomName = document.querySelector('.sidebar h3');
  roomName.innerText = `Game Room ${name}`;
}

// output room members
function showUsers(users) {
  // let memberList = document.querySelector('.members ul');
  let players = document.querySelector('.content .scores h2')

  if(users[1]) {
    players.innerText = `${users[0].username} Vs ${users[1].username}`
  } else {
    players.innerText = `Waiting for an opponent`
  }
}


// gamebox selector
let squares = document.querySelectorAll('.board .game div');

squares.forEach((box, index) => {
  box.addEventListener('click', (e) => {
    if(!e.target.innerText) {
      socket.emit('entry', index);
    }
  })
})


// show changes 
socket.on('entry', data => {
  squares[data[0]].innerText = data[1];
})

socket.on('changeTurn', data => {
  document.querySelector('.board .game').className = `game ${data.className}`
})


// update game on input
// function show(data) {
//   squares[data[1]].innerText = data[0];
//   getBoardState();
// }
