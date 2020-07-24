let users = [];

class game {
  constructor() {
    this.currentUser = null;
  }

  static formatMsg(username, text, position) {
    return {
      username,
      text,
      position
    }
  }

  static userJoin(id, username, room) {
    const user = {id, username, room};

    users.push(user);
    console.log('Joined')
    console.log(users)
    return user;
    
  }

  static getCurrentUser(id) {
    users.forEach(person => {
      if (person.id == id) {
        this.currentUser = person;
      }
    })
    console.log(this.currentUser);
    console.log(`get ${id}`);
    console.log(users);
    return this.currentUser;
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