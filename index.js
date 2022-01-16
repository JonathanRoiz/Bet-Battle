// Have different plays be in different rooms using socket.join("Room Name"), and io.to("Room Name").emit("some event");
// Line 323
// Potentially might not do this
// Make animation or something for winner
let cubeNumPlayers = 5;

const Database = require("@replit/database");
const db = new Database();
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var approx = require('approximate-number');
var express = require('express');
var path = require('path');
var assets = path.join(__dirname, 'Assets');
var scripts = path.join(__dirname, 'Scripts');
app.use(express.static(assets));
app.use(express.static(scripts));

function Person(username, password) {
  this.username = username;
  this.password = password;
  this.caseBux = 0;
  this.inventory = [];
  this.sessionId = "";
}

let users = {};
let sessions = [];
let market = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

function sortItems() {
  for (const username in users) {
  var inventory = users[username].inventory;
    inventory.sort(function(a, b) {
      return a[1] - b[1]
    });
    inventory.reverse();
  }
}

db.get("Players").then(value => {
  users = value.users
});

db.get("Market").then(value => {
  market = value.market
});

io.on('connection', function(socket) {
  socket.on('console.log', (words) => {
    console.log(words);
  });
  socket.on('checkSession', (id) => {
    if (id !== "") {
      for (let i = 0; i < sessions.length; i++) {
        if (id == sessions[i].sessionId) {
          socket.emit('setUser', sessions[i],sessions[i].sessionId)
          socket.emit('startGame', sessions[i].username, sessions[i].password, sessions[i].caseBux);
          return
        }
      }
      // Stop session
      socket.emit('deleteSession');

    } else {
      socket.emit('loadLogin')
    }
  });

  socket.on('sell', (item, plr) => {
    let player = users[plr.username];
    
    for (let i = 0; i < player.inventory.length; i++) {
      if (player.inventory[i][0] == item) {
        player.caseBux += player.inventory[i][1];
        if (player.inventory[i][4] > 1) {
          player.inventory[i][4] -= 1;
        } else {
          player.inventory.splice(i, 1);
        }
      }
    }
  });

  socket.on('add', (item, plr) => {
    let player = users[plr.username];
    
    for (let i = 0; i < player.inventory.length; i++) {
      if (player.inventory[i][0] == item) {
        market.push({seller: plr.username, price: 10, item: player.inventory[i]});
        if (player.inventory[i][4] > 1) {
          player.inventory[i][4] -= 1;
        } else {
          player.inventory.splice(i, 1);
        }
      }
    }
    
  });

  socket.on('register', (username, password) => {
    if (!users[username.toLowerCase()]) {
      users[username.toLowerCase()] = new Person(username, password);
      db.set("Players", {users}).then(() => {});
      socket.emit('created')
    } else {
      console.log("username already taken");
      socket.emit('taken')
    }
  });

  socket.on('login', (username, password) => {
    if (users[username.toLowerCase()]) {
      if (users[username.toLowerCase()].password == password) {
        console.log("successfully logged in");
        users[username.toLowerCase()].sessionId = socket.id;
        sessions.push(users[username.toLowerCase()]);
        socket.emit('setUser', users[username.toLowerCase()],socket.id);
        socket.emit('startGame', username, password, users[username.toLowerCase()].caseBux);
      } else {
        socket.emit('incorrectPassword');
      }
    } else {
      socket.emit('invalidUsername')
    }
  });

  socket.on('logout', (username) => {
    users[username.username.toLowerCase()].sessionId = "";
    for (let i = 0; i < sessions.length; i++) {
      if (sessions[i].username == username.username) {
        sessions.splice(i, 1);
      }
    }
  });

  socket.on('flipCoin', (guess,user, amountBet) => {
    let playersMoney = users[user.username.toLowerCase()].caseBux;
    if (parseInt(amountBet) <= playersMoney) {
      let coin;
      if (Math.random() < .5) {
        coin = "Tails";
      } else {
        coin = "Heads";
      };
      
      if (coin == guess) {
        playersMoney += parseInt(amountBet);
        users[user.username.toLowerCase()].caseBux = playersMoney;
      } else {
        playersMoney -= parseInt(amountBet);
        users[user.username.toLowerCase()].caseBux = playersMoney;
      }
    }
  });

  socket.on("buyCommon", (user) => {
    user = users[user.username.toLowerCase()];

    let commonItems = [['Shirt',10,'common','Sword.png'],['Pants',8,'common','Sword.png'],['Hat',7,'common','Sword.png'],['Shoes',6,'common','Sword.png']];
    let uncommonItems = [['Armor',20,'uncommon','Sword.png'],['Sword',25,'uncommon','Sword.png'],['Shield',16,'uncommon','Sword.png']];
    let rareItems = [['Magic Wand',45,'rare','Sword.png'],['Magic Armor',36,'rare','Sword.png'],['Magic Shield',42,'rare','Sword.png']];
    let epicItems = [['Bazooka',368,'epic','Bazooka.png'],['Atomic Armor',318,'epic','Sword.png'],['Atomic Shield',280,'epic','Sword.png']];
    
    if (user.caseBux >= 10) {
      
      let item;
      let random = Math.random();
      if (random < 0.8) {
        item = commonItems[Math.floor(Math.random() * commonItems.length)];
      } else if (random < .99) {
        item = uncommonItems[Math.floor(Math.random() * uncommonItems.length)];
      } else if (random < .999) {
        item = rareItems[Math.floor(Math.random() * rareItems.length)];
      } else {
        item = epicItems[Math.floor(Math.random() * epicItems.length)];
      }

      let add = true;
      for (i = 0; i < user.inventory.length; i++) {
        if (user.inventory[i][0] == item[0]) {
          add = false;
        }
      }

      if (add) {
        user.inventory.push(item);
        for (i = 0; i < user.inventory.length; i++) {
          if (user.inventory[i][0] == item[0]) {
            user.inventory[i].push(1);
          }
        }
      } else {
        for (i = 0; i < user.inventory.length; i++) {
          if (user.inventory[i][0] == item[0]) {
            user.inventory[i][4] += 1;
          }
        }
      }
      
      user.caseBux -= 10;
      socket.emit("opened", item);
    }
  });

  socket.on('click', (user) => {
    users[user.username.toLowerCase()].caseBux += 1;
  });

  socket.on('disconnect', function() {
    //console.log(socket.id+' has disconnected');
  });
});


setInterval(function() {
  if (Object.keys(users).length != 0) {
    db.set("Players", {users}).then(() => {});
  }
  if (Object.keys(market).length != 0) {
    db.set("Market", {market}).then(() => {});
  }
  //db.delete("Players").then(() => {});
  //console.log(users);
  //console.log(sessions);
  sortItems();
},1000);

setInterval(function() {
  io.emit("updateLoop", users, market);
},20);

// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\
// Test Code \\

var path = require('path');

function CubePlayer(id,x,y,name,color,size) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.name = name;
  this.color = color;
  this.size = size;
}


function Point(x,y,size) {
  this.x = x;
  this.y = y;
  this.size = size;
}

function Wall(x,y,width,height,name) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.name = name;
}

let queue = [];

players = [];

points = [];

walls = [];

walls[0] = new Wall(-2050,-2050,4110,50,"wall"+0);
walls[1] = new Wall(-2050,2050,4110,50,"wall"+1);
walls[2] = new Wall(-2050,-2050,50,4150,"wall"+2);
walls[3] = new Wall(2050,-2050,50,4150,"wall"+3);

let movespeed = 4;

function isCollide(a, b) {
  if ((a) || (b)) {
  return !(
    ((a.y + (a.size)) < (b.y)) ||
    (a.y > (b.y + b.size)) ||
    ((a.x + (a.size)) < b.x) ||
    (a.x > (b.x + b.size))
  );
  };
}

function isCollideWall(a, b) {
  if ((a) && (b)) {
  return !(
    ((a.y + (a.size)) < (b.y)) ||
    (a.y > (b.y + (b.height))) ||
    ((a.x + (a.size)) < b.x) ||
    (a.x > (b.x + b.width))
  );
  };
}

for (var i = 0; i < 200; i++) {
  points[i] = new Point(Math.floor((Math.random()*3950)-1975),Math.floor((Math.random()*3950)-1975),25);
}

io.on('connection', function(socket) {
  socket.on('initiate', (username) => {
    console.log(socket.id);
    socket.emit('setId',socket.id);
    function joined(element, index, array) {
      console.log(element.name != username);
      return element.name == username;
    }
    if (!queue.find(joined)) {
      if (players.length == 0) {
        queue.push(new CubePlayer(socket.id,0,0,username));
      } else {
        socket.emit('alert', 'Please wait for the previous round to finish');
      }
    } else {
      socket.emit('alert',"You're account has already joined");
    }
    if (queue.length >= cubeNumPlayers) {
      for (let i = 0; i < queue.length; i++) {
        players.push(queue[i]);
      }
      queue = [];
    }
  });

  // This runs too many times, even before it needs to be ran
  socket.on('updatepos', (id,name,color,movement) => {
    if (players.length == 1) {
      io.emit("died",players[0]);
      console.log(players[0].name + ' has won!');
      users[players[0].name].caseBux += 100;
      players.splice(0,1);
    }
    for (var i = 0; i < players.length; i++) {
      for (var v = 0; v < players.length; v++) {
        if (players[i].id !== players[v].id) {
        if (isCollide(players[i],players[v])) {
          if (players[i].size > players[v].size) {
            players[i].size += (players[v].size/2);
            players[i].x -= players[v].size/2;
            players[i].y -= players[v].size/2
            io.emit("died",players[v]);
            players.splice(v,1);
            break;
          } else if (players[v].size > players[i].size) {
            players[v].size += (players[i].size/2);
            players[v].x -= players[i].size/2;
            players[v].y -= players[i].size/2
            io.emit("died",players[i]);
            players.splice(i,1);
            break;
          }
        }
        }
      }

      for (var v = 0; v < points.length; v++) {
        if (players[i]) {
        if (players[i].size) {
        if (isCollide(players[i],points[v])) {
          players[i].size += 1;
          players[i].x -= .5;
          players[i].y -= .5;
          points[v] = new Point(Math.floor((Math.random()*4000)-2000),Math.floor((Math.random()*4000)-2000),25);
        }
        }
        }
      }

      for (var v = 0; v < walls.length; v++) {
        if (isCollideWall(players[i],walls[v])) {
          if (walls[v].name == "wall0") {
            if (movement[0]) {
              players[i].y += movespeed;
            }
          }
          if (walls[v].name == "wall1") {
            if (movement[2]) {
              players[i].y -= movespeed;
            }
          }
          if (walls[v].name == "wall2") {
            if (movement[1]) {
              players[i].x += movespeed;
            }
          }
          if (walls[v].name == "wall3") {
            if (movement[3]) {
              players[i].x -= movespeed;
            }
          }
        }
      }

      if (players[i]) {
        if (players[i].id == id) {
          if (movement[0]) {
            players[i].y -= movespeed;
          }
          if (movement[1]) {
            players[i].x -= movespeed;
          }
          if (movement[2]) {
            players[i].y += movespeed;
          }
          if (movement[3]) {
            players[i].x += movespeed;
          }
          if (players[i].size) {
            players[i] = new CubePlayer(id,players[i].x,players[i].y,name,color,players[i].size);
          } else {
            players[i] = new CubePlayer(id,(Math.random() * 3500)-1750,(Math.random() * 3500)-1750,name,color,40);
          }
        }
      }
    }
  });
  socket.on('disconnect', function() {
    for (let i = 0; i < queue.length; i++) {
      if (socket.id == queue[i].id) {
        queue.splice(i,1);
        console.log("cubeeatcube session deleted");
      }
    }
    /* ONLY DELETE IF THEY ARE GONE FOR OVER 30 SECONDS
    for (let i = 0; i < sessions.length; i++) {
      if (socket.id == sessions[i].sessionId) {
        sessions.splice(i,1);
        console.log("session deleted");
      }
    }
    */
    for (var i = 0; i < players.length; i++) {
      if (players[i]) {
      if (socket.id == players[i].id) {
        players.splice(i,1);
        console.log("player left")
      }
      }
    }
  });
});

setInterval(function() {
  players.sort( function( a , b) {
    return a.size - b.size
  });
  io.emit('updatepos',players,points,walls,queue.length,queue); // queue is a test
},7);

http.listen(process.env.PORT || 5000, () => {
  console.log('listening on *:' + process.env.PORT || 5000);
});
