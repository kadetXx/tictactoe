// get username and room from homepage
let { username, room  } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

if (!username) {

  //check localstorage for username
  username = localStorage.getItem('traverticUser') || prompt('Choose a username');;

  if (username == null || username == '' || username.indexOf(' ') !== -1 || room == null || room == '' || room.indexOf(' ') !== -1) {
    window.location.href = '/error.html'
  } else {

    //send username to local storage
    localStorage.setItem('traverticUser', username);

    //init socket
    const socket = io();
    
    // join chatroom 
    socket.emit('joinRoom',  {username, room});

    // set chat url
    document.querySelector('#join').setAttribute('href', window.location.href);

    // set room admin
    socket.on('admin', status => {
      document.querySelector('.toggle-buttons').innerHTML += 
      `
      <button id="#reset" class="btn btn-dark">Play Again</button>
      `
    })

    // show init message 
    socket.on('message', message => {
      let msgBox = document.querySelector('#chat-messages div');

      let msg = document.createElement('div');
      msg.className = message.position
      msg.innerHTML = `<small>${message.username}</small><p>${message.text}</p>`;

      msgBox.appendChild(msg);
    })

    // show error on server restart
    socket.on('reload', data => {
      let board = document.querySelector('.dashboard .content');
      let reloadUrl = window.location.href
      board.innerHTML = `
      <div class="error-message">
      <i class="material-icons">
      sentiment_very_dissatisfied
      </i>
      <h1>Opps! Couldn't connect</h1>
      <p>Seems like you are no longer connected to the game, try <a href="${reloadUrl}">reloading the page</a></p>
      </div>
      `
    })

    // allow users send messages
    let form = document.querySelector('#chat');
    let scrollableArea = document.querySelector('#chat-messages');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      scrollableArea.scrollTop = scrollableArea.scrollHeight;

      setTimeout(() => {
        window.scrollBy(0, 1000)
      }, 500);

      let message = document.querySelector('#chat input');

      if (!message.value.length < 1) {
        const msg = e.target.elements.msg.value;
        e.target.elements.msg.value = ''
        socket.emit('chatMessage', msg);
      }
    })

    // enable emojis
    document.querySelectorAll('.emojis div').forEach(emoji => {
      emoji.addEventListener('click', (e) => {
        document.querySelector('#msg').value += emoji.innerText
        document.querySelector('#msg').focus();
      })
    })


    // get room name and users
    socket.on('roomUsers', ({room, users}) => {
      showName(room);
      showUsers(users);
    })

    // output room name
    function showName(name) {
      let roomName = document.querySelector('.sidebar p span');
      roomName.innerText = `${name}`;
    }

    // output room members
    function showUsers(users) {
      
      let players = document.querySelector('.content .scores h2')

      if(users[1]) {
        players.innerText = `${users[0].username} Vs ${users[1].username}`
      } else {
        players.innerText = `Waiting for an opponent...`
        socket.emit('state-change', [
          ' ',' ',' ',
          ' ',' ',' ',
          ' ',' ',' ',
        ]);
      }
    }


    // alow users click gamebox
    let squares = document.querySelectorAll('.board .game div');

    squares.forEach((box, index) => {
      box.addEventListener('click', (e) => {
        if(e.target.innerText = ' ') {
          socket.emit('entry', index);
        }
      })
    })


    // show changes 
    socket.on('entry', data => {
      squares[data[0]].innerText = data[1];

      getBoardState();
    })

    // change turn
    socket.on('changeTurn', data => {
      document.querySelector('.board .game').className = `game ${data.className}`
    })

    // state change
    function getBoardState() {
      let obj = [];
      squares.forEach((square, index) => {
        if (square.innerText) {
          obj[index] = square.innerText;
        } else {
          obj[index] = ' ';
        }
      })

      socket.emit('state-change', obj)
    } 

    // receive changes and check for game over
    socket.on('state-change', (state) => {
      
      squares.forEach((square, index) => {
        square.innerText = state[index];
      })

      let rows = [
        `${state[0]} ${state[1]} ${state[2]}`,
        `${state[3]} ${state[4]} ${state[5]}`,
        `${state[6]} ${state[7]} ${state[8]}`,
        `${state[0]} ${state[4]} ${state[8]}`,
        `${state[2]} ${state[4]} ${state[6]}`,
        `${state[0]} ${state[3]} ${state[6]}`,
        `${state[1]} ${state[4]} ${state[7]}`,
        `${state[2]} ${state[5]} ${state[8]}`,
      ];

      let win = ['X X X', 'O O O'];

      rows.forEach(row => {
        if (row == win[0] || row == win[1]) {
        socket.emit('gameOver', 'Game Over');
        } else if (row.indexOf(' ') == -1) {
          socket.emit('gameOver', 'Draw');
        }
      })
    });

    //on game over 
    socket.on('gameOver', data => {
      document.querySelector('.scores h2').innerText = `${data}`
      
    })

  }
} 




