const socket = io();

// show init message 
socket.on('message', message => {
  let msgBox = document.querySelector('#chat-messages div');

  let p = document.createElement('p');
  p.className = message[1]
  p.innerText = message[0];

  msgBox.appendChild(p);
})

// allow users send messages
let form = document.querySelector('#chat');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  e.target.elements.msg.value = ''
  socket.emit('chatMessage', msg);
})