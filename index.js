let express = require('express');
let exphbs = require('express-handlebars');
let app = express();
let http = require('http').Server(app);
let SocketIO = require('socket.io');
let mime = require('mime')
const PORT = process.env.PORT || 3000;
const multipartyOptions = {
  autoFiles: true
};
let nocache = require('nocache')
app.use(nocache())

let mimeSafeSend = (filename, res) => {
  // mime type
  let type = mime.getType(filename);

  // header fields
  if (!res.getHeader('content-type')) {
    var charset = null; //mime.getType(type);
    res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
  }
  res.sendFile(filename);
}

app.engine('.hbs', exphbs({
  extname: '.hbs'
}));
app.set('view engine', '.hbs');
let path = require('path');
let aVar = 0;

app.get('/webs/game.js', function(req, res) {
  mimeSafeSend(path.join(__dirname, '/webs/game.js'), res)
})

app.set('views', path.join(__dirname, 'webs'));

app.get('/', (req, res) => {
  res.render("website")
})

let server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))
let io = SocketIO.listen(server);
let players = {};
let enemys = [];
io.on('connection', function(socket) {
  console.log('a user connected');
  players[socket.id] = {
    x: 300,
    y: 300,
    name: 'NoName'
  };
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  })
  socket.on('setName', function(data) {
    players[socket.id].name = data;
  })
  socket.on('disconnect', function() {
    delete players[socket.id];
  })
  setInterval(function() {
    io.emit('playerState', players)
    io.emit('enemyState', enemys)
  }, 1000 / 60)
});

setInterval(function() {
  if (enemys.length < 20) {
    enemys.push({
      ind: enemys.length,
      ai: Math.floor(Math.random() * 5),
      x: Math.random() * 600,
      y: Math.random() * 600,
      color: "rgb(0,0,0)"
    })
  }
}, 2000);

function updateEnemies() {
  for (let i = 0; i < enemys.length; i++) {

    if(enemys[i].ai == 0)
    {
    enemys[i].x = enemys[i].x + Math.random() * 10 - 5;
    enemys[i].y = enemys[i].y + Math.random() * 10 - 5;
  }
  else if (enemys[i].ai == 1){

  }
  }
}

setInterval(function() {
  updateEnemies();
}, 1000 / 30);
