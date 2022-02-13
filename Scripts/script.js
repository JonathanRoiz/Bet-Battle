let canvas = document.getElementById("myCanvas"); // Test
let divId = document.getElementById("divId"); // Test
let playersInventory = [];
let socket = io();
let moneyDisplay = document.getElementById("moneyDisplay");
let cases = document.getElementById("cases");
let inventory = document.getElementById("inventory");
let opened = document.getElementById("opened");
let openedText = document.getElementById("openedText");
let openedImage = document.getElementById("openedImage");
let openedValue = document.getElementById("openedValue");
let clicker = document.getElementById("clicker");
let marketplace = document.getElementById("marketplace");
let amountBet = document.getElementById("amountBet");
let common = document.getElementById("common");
//let uncommon = document.getElementById("uncommon");
let game = document.getElementById("game");
let username = document.getElementById("username");
let username2 = document.getElementById("username2"); // Username under Register
let password = document.getElementById("password");
let password2 = document.getElementById("password2"); // Password under Register
let invalid = document.getElementById("invalid");
let incorrect = document.getElementById("incorrect");
let login = document.getElementById("login");
let registerForm = document.getElementById("register");
let cubeEatCube = document.getElementById("cubeeatcube");
let navigator = document.getElementById("navigator");

let roundInProgress = false;

function print(words) {
  socket.emit("console.log", words);
}

socket.on("socket", () => {
  print("hola");
});

login.style.display = "none";
registerForm.style.display = "none";
marketplace.style.display = "none";

socket.on("loadLogin", () => {
  login.style.display = "block";
  registerForm.style.display = "block";
});

socket.on("startGame", (username, password, money) => {
  login.style.display = "none";
  registerForm.style.display = "none";
  game.style.display = "block";
});

socket.on("taken", () => {
  invalid.innerHTML = "This username is unavailable";
  invalid.style.color = "red";
  invalid.style.display = "block";
});

socket.on("created", () => {
  invalid.innerHTML = "User successfully created!";
  invalid.style.color = "green";
  invalid.style.display = "block";
});

socket.on("incorrectPassword", () => {
  incorrect.innerHTML = "Incorrect Password!";
  incorrect.style.color = "red";
  incorrect.style.display = "block";
});

socket.on("invalidUsername", () => {
  incorrect.innerHTML = "This username does not exist!";
  incorrect.style.color = "red";
  incorrect.style.display = "block";
});

function signIn() {
  if (username.value && password.value) {
    socket.emit("login", username.value, password.value);
  }
}

function register() {
  if (username2.value && password2.value) {
    socket.emit("register", username2.value, password2.value);
  }
}

common.setAttribute("style", "background-color: lightgrey;");
//uncommon.setAttribute("style", "background-color: lightgreen;");

let user = "null";

function refresh() {
  window.location.reload();
}

function logout() {
  document.cookie =
    "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  socket.emit('logout', user);
  setTimeout(refresh(), 1000);
}

function createDiv(player) {
  inventory.textContent = "";
  for (let i = 0; i < player.inventory.length; i++) {
    let div = document.createElement("div");
    let text = document.createElement("h1");
    let valueDisplay = document.createElement("h2");
    let amountDisplay = document.createElement("h2");
    let itemImage = document.createElement("img");

    itemImage.src = player.inventory[i][3];
    itemImage.setAttribute("class", "itemImage");

    let imageHeight = (itemImage.height / itemImage.width) * div.width;

    itemImage.setAttribute("width", "100%");
    itemImage.setAttribute("height", imageHeight);

    div.setAttribute("class", "item");
    amountDisplay.setAttribute("class", "itemAmount");
    amountDisplay.innerHTML = player.inventory[i][4];
    valueDisplay.setAttribute("class", "itemValue");
    valueDisplay.innerHTML = player.inventory[i][1];
    text.innerHTML = player.inventory[i][0];
    text.setAttribute("class", "itemName");

    if (player.inventory[i][2] == "common") {
      div.setAttribute("style", "background-color: lightgrey;");
    } else if (player.inventory[i][2] == "uncommon") {
      div.setAttribute("style", "background-color: lightgreen;");
    } else if (player.inventory[i][2] == "rare") {
      div.setAttribute("style", "background-color: lightblue;");
    } else if (player.inventory[i][2] == "epic") {
      div.setAttribute("style", "background-color: plum;");
    }

    div.addEventListener("mouseover", function() {
      if (div.children.length <= 4) {
        let menu = document.createElement("div");
        let sell = document.createElement("h1");
        let add = document.createElement("h1");
        sell.setAttribute("class", "sell");
        sell.innerHTML = "Sell";
        add.setAttribute("class", "sell");
        add.innerHTML = "Add";
        menu.setAttribute("class", "item");
        menu.setAttribute("style", "background-color: lightgrey");
        menu.appendChild(sell);
        menu.appendChild(add);
        div.appendChild(menu);

        sell.addEventListener("mousedown", function() {
          socket.emit("sell", player.inventory[i][0], player);
        });

        add.addEventListener("mousedown", function() {
          socket.emit("add", player.inventory[i][0], player);
        });
      }
    });
    
    div.appendChild(itemImage);
    div.appendChild(amountDisplay);
    div.appendChild(valueDisplay);
    div.appendChild(text);
    inventory.appendChild(div);
  }
}

// Start test code
function drawMarket(market) {
  marketplace.textContent = "";
  for (let i = 0; i < market.length; i++) {
    let div = document.createElement("div");
    let text = document.createElement("h1");
    let valueDisplay = document.createElement("h2");
    let amountDisplay = document.createElement("h2");
    let itemImage = document.createElement("img");

    itemImage.src = market[i].item[3];
    itemImage.setAttribute("class", "itemImage");

    let imageHeight = (itemImage.height / itemImage.width) * div.width;

    itemImage.setAttribute("width", "100%");
    itemImage.setAttribute("height", imageHeight);

    div.setAttribute("class", "item");
    amountDisplay.setAttribute("class", "itemAmount");
    amountDisplay.innerHTML = market[i].item[4];
    valueDisplay.setAttribute("class", "itemValue");
    valueDisplay.innerHTML = market[i].item[1];
    text.innerHTML = market[i].item[0];
    text.setAttribute("class", "itemName");

    if (market[i].item[2] == "common") {
      div.setAttribute("style", "background-color: lightgrey;");
    } else if (market[i].item[2] == "uncommon") {
      div.setAttribute("style", "background-color: lightgreen;");
    } else if (market[i].item[2] == "rare") {
      div.setAttribute("style", "background-color: lightblue;");
    } else if (market[i].item[2] == "epic") {
      div.setAttribute("style", "background-color: plum;");
    }
    
    div.appendChild(itemImage);
    div.appendChild(amountDisplay);
    div.appendChild(valueDisplay);
    div.appendChild(text);
    marketplace.appendChild(div);
  }
}
// End test code

socket.on("updateLoop", (users, market) => {
  if (user != "null") {
    if (users[user.username.toLowerCase()]) {
      moneyDisplay.innerHTML =
        "Coins: " + users[user.username.toLowerCase()].caseBux;
      createDiv(users[user.username.toLowerCase()]);
      drawMarket(market);
    }
  }
  // add market code here
});

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

socket.emit("checkSession", getCookie("sessionId"));

socket.on("setUser", (thisUser, id) => {
  document.cookie = "sessionId=" + id;
  user = thisUser;
  moneyDisplay.innerHTML = "Coins: " + user.caseBux;
});

socket.on("deleteSession", function () {
  document.cookie = "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  login.style.display = "block";
  registerForm.style.display = "block";
});

function flipCoin(guess) {
  print(user.caseBux);
  if (parseInt(amountBet.value) > 0) {
    socket.emit("flipCoin", guess, user, amountBet.value);
  }
}

socket.on("alert", function (message) {
  alert(message);
});

// Finish this function
socket.on("opened", function (item) {
  opened.style.display = "block";
  openedText.innerHTML = "You opened a " + item[0];
  openedImage.setAttribute("src", item[3]);
  openedImage.setAttribute("width", "55%");
  openedValue.innerHTML = item[1];
});

let clickDebounce = true;

function debounceFunction() {
  clickDebounce = true;
}

function clickMoney() {
  if (clickDebounce == true) {
    clickDebounce = false;
    socket.emit("click", user);
    setTimeout(debounceFunction, 100);
  }
}

function exit() {
  opened.style.display = "none";
}
for (i = 0; i < 2; i++) {
  document.getElementsByClassName("price")[i].style.color = "#ff00ff";
}

let debounce = true;
function buyDelay() {
  debounce = true;
}
function buyCommon() {
  socket.emit("buyCommon", user);
}
let coinflip = document.getElementById("CoinFlip");

canvas.style.display = 'none';
divId.style.display = 'none';

function closeAll() {
  coinflip.style.display = "none";
  cases.style.display = "none";
  inventory.style.display = "none";
  clicker.style.display = "none";
  marketplace.style.display = "none";
  canvas.style.display = 'none';
  divId.style.display = 'none';
}

function openCases() {
  if (!roundInProgress) {
    closeAll();
    cases.style.display = "block";
  } else {
    alert("Round is in progress!");
  }
}
function openInventory() {
  if (!roundInProgress) {
    closeAll();
    inventory.style.display = "block";
  } else {
    alert("Round is in progress!");
  }
}
function openClicker() {
  if (!roundInProgress) {
    closeAll();
    clicker.style.display = "block";
  } else {
    alert("Round is in progress!");
  }
}
function openCoinFlip() {
  if (!roundInProgress) {
    closeAll();
    coinflip.style.display = "block";
  } else {
    alert("Round is in progress!");
  }
}
function openMarketplace() {
  if (!roundInProgress) {
    closeAll();
    marketplace.style.display = "block";
  } else {
    alert("Round is in progress!");
  }
}
function openCubeEatCube() {
  if (!roundInProgress) {
    closeAll();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    divId.style.display = 'block';
    canvas.style.display = 'block';
  }
}

// Start Minigame code \\

// work on the scale of the players names next
let ctx = canvas.getContext("2d");
let button = document.getElementById("button");
let nameEnter = document.getElementById("nameEnter");
let div = document.getElementById("divId");
let waiting = document.getElementById("waiting");
let playButton = document.getElementById("playButton");
let playersInQueue = document.getElementById("playersInQueue");
let cubeTitle = document.getElementById("cubeTitle");
let timer = document.getElementById("timer");
let cubeAmountBet = document.getElementById("cubeAmountBet");

socket.on("tick", (time) => {
  timer.innerHTML = "Starting in: " + time;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function play() {
  if (parseInt(cubeAmountBet.value) > 0) {
    socket.emit('initiate', user.username, cubeAmountBet.value);
  }
  //div.style.display = 'none';
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

dPressed = false;
aPressed = false;
wPressed = false;
sPressed = false;

function keyDownHandler(e) {
  if (e.keyCode == 68) {
    dPressed = true;
  }
  if (e.keyCode == 65) {
    aPressed = true;
  }
  if (e.keyCode == 87) {
    wPressed = true;
  }
  if (e.keyCode == 83) {
    sPressed = true;
  }
}
function keyUpHandler(e) {
  if (e.keyCode == 68) {
    dPressed = false;
  }
  if (e.keyCode == 65) {
    aPressed = false;
  }
  if (e.keyCode == 87) {
    wPressed = false;
  }
  if (e.keyCode == 83) {
    sPressed = false;
  }
}

let plrId;

socket.on('setId', function(id) {
  plrId = id;
  timer.style.display = 'block';
});

socket.on('died', function(player) {
  if (player.id == plrId) {
    aPressed = false;
    wPressed = false;
    sPressed = false;
    dPressed = false;
    div.style.display = 'block';
    name = "null";
    plrId = "null";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    roundInProgress = false;
    cubeTitle.style.display = 'block';
    playersInQueue.style.display = 'block';
    playButton.style.display = 'block';
    timer.style.display = 'none';
    cubeAmountBet.style.display = 'block';
  }
});
m = 0
let colors = ['black', 'blue', 'grey', 'red', 'pink'];
let color = colors[Math.floor(Math.random() * colors.length)]
let scale = 1;

// When it gets the player, the amountBet throws it off
socket.on('updatepos', function(players, points, walls, numQueue,queue,numPlr) {
  // Test
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].id == plrId) {
      playButton.style.display = 'none';
      waiting.style.display = 'block';
    }
  }
  for (let i = 0; i < players.length; i++) {
    if (plrId == players[i].id) {
      // Player is in round
      timer.style.display = 'none';
      playersInQueue.style.display = 'none';
      cubeTitle.style.display = 'none';
      waiting.style.display = 'none';
      playButton.style.display = 'none';
      cubeAmountBet.style.display = 'none';
    }
  }
  // End Test
  playersInQueue.innerHTML = numQueue + '/' + numPlr;
  name = user.username;
  if (name !== "null") {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.scale(scale, scale);
    for (var i = 0; i < players.length; i++) {
      if (players[i].id == plrId) {
        ctx.translate(-players[i].x + (canvas.width / 2) / scale - players[i].size / 2, -players[i].y + (canvas.height / 2) / scale - players[i].size / 2);
        scale = 1 - (players[i  ].size / 1000);
        if (scale < .25) {
          scale = .25;
        }
      }
    }
    for (var i = 0; i < points.length; i++) {
      ctx.fillRect(points[i].x, points[i].y, points[i].size, points[i].size);
    }

    for (var i = 0; i < players.length; i++) {
      ctx.fillStyle = players[i].color;
      ctx.fillRect(players[i].x, players[i].y, players[i].size, players[i].size);
      ctx.fillStyle = "white";
      ctx.font = players[i].size / 2 + "px Arial";
      ctx.fillText(players[i].name, players[i].x + (players[i].size / 2), players[i].y + (players[i].size / 2));
      if (players[i].id == plrId) {
        ctx.fillStyle = "black";
        for (var v = 0; v < walls.length; v++) {
          ctx.fillRect(walls[v].x, walls[v].y, walls[v].width, walls[v].height);
        }
        ctx.font = 30 / scale + "px Arial";
        ctx.translate(players[i].x - (canvas.width / 2) / scale + players[i].size / 2, players[i].y - (canvas.height / 2) / scale + players[i].size / 2);
        ctx.fillText("Size: " + Math.floor(players[i].size), (canvas.width / 2) / scale, (canvas.height / 15) / scale);
        ctx.translate(-players[i].x + (canvas.width / 2) / scale - players[i].size / 2, -players[i].y + (canvas.height / 2) / scale - players[i].size / 2);
      }
    }

    ctx.restore();
  }
});

movement = [];

setInterval(function() {
  if (name !== "null") {
    movement[0] = wPressed;
    movement[1] = aPressed;
    movement[2] = sPressed;
    movement[3] = dPressed;
    socket.emit('updatepos', plrId, name, color, movement);
  }
}, 16.66);
