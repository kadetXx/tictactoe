let users = [];

class game {
  constructor() {
    
  }

  static formatMsg(username, text, position) {
    return {
      username,
      text,
      position
    }
  }

  static userJoin(id, username, room) {
    const user = {id, username, room}

    users.push(user);

    return user;
  }

  static getCurrentUser(id) {
    return users.find(user => user.id = id);
  }

  static userLeaves(id) {
    const index = users.findIndex(user => user.id == id);

    if (index !== -1) {
     return users.splice(index, 1)[0];
    }
  }

  static getRoomUsers(room) {
    return users.filter(user => user.room == room);
  }
}


module.exports = game;