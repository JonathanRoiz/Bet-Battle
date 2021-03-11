const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('initiate', () => {
    //console.log(socket.id+' has connected');
  });

  socket.on('disconnect', function() {
    //console.log(socket.id+' has disconnected');
  });
});

http.listen(3001, () => {
  console.log('listening on *:3001');
});