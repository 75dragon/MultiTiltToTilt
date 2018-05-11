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

let mimeSafeSend = (filename, res) =>
{
  // mime type
  let type = mime.getType(filename);
  // header fields
  if (!res.getHeader('content-type'))
  {
    var charset = null; //mime.getType(type);
    res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
  }
  res.sendFile(filename);
}

app.engine('.hbs', exphbs(
{
  extname: '.hbs'
}));
app.set('view engine', '.hbs');
let path = require('path');
let aVar = 0;

app.get('/webs/game.js', function(req, res)
{
  mimeSafeSend(path.join(__dirname, '/webs/game.js'), res)
})

app.get('/webs/controls.js', function(req, res)
{
  mimeSafeSend(path.join(__dirname, '/webs/controls.js'), res)
})

app.set('views', path.join(__dirname, 'webs'));

app.get('/', (req, res) =>
{
  res.render("website")
})

let server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))
let io = SocketIO.listen(server);
let playerIds = [];
let players = {};
let enemys = [];
let dead = [];
let img = ""

io.on('connection', function(socket)
{
  console.log('a user connected');
  players[socket.id] = {
    id: socket.id,
    hp: 10,
    x: 300,
    y: 300,
    name: 'NoName',
    color: 'rgb(0,0,0)'
  };
  playerIds.push(socket.id)
  socket.on('movement', function(data)
  {
    var player = players[socket.id] ||
    {};
    if (data.left)
    {
      player.x -= 5;
      if (player.x < 0)
      {
        player.x = 0;
      }
    }
    if (data.up)
    {
      player.y -= 5;
      if (player.y < 0)
      {
        player.y = 0;
      }
    }
    if (data.right)
    {
      player.x += 5;
      if (player.x > 800)
      {
        player.x = 800;
      }
    }
    if (data.down)
    {
      player.y += 5;
      if (player.y > 600)
      {
        player.y = 600;
      }
    }
  })
  socket.on('setName', function(data)
  {
    players[socket.id].name = data;
  })
  socket.on('disconnect', function()
  {
    delete players[socket.id];
    playerIds.splice(playerIds.indexOf(socket.id), 1);
  })
  setInterval(function()
  {
    io.emit('playerState', players)
    io.emit('enemyState', enemys)
    io.emit('deadPlayers', dead)
  }, 1000 / 60)
});

setInterval(function()
{
  if (enemys.length < 20 && playerIds.length > 0)
  {
    enemys.push(
    {
      hitDes: true,
      id: enemys.length,
      ai: Math.floor(Math.random() * 3),
      x: Math.random() * 600,
      y: Math.random() * 600,
      color: "rgb(" + Math.floor(Math.random() * 200) + "," + Math.floor(Math.random() * 200) + "," + Math.floor(Math.random() * 200) + ")",
      spd: 3
    })
  }
}, 2000);

function updateEnemies()
{
  for (let i = 0; i < enemys.length; i++)
  {

    if (enemys[i].ai == 0)
    {
      enemys[i].x = enemys[i].x + Math.random() * 10 - 5;
      enemys[i].y = enemys[i].y + Math.random() * 10 - 5;
    }
    else if (enemys[i].ai == 1)
    {
      if (playerIds.length > 0)
      {
        if (!('stalk' in enemys[i]) || playerIds.indexOf(enemys[i].stalk) == -1)
        {
          enemys[i].stalk = playerIds[Math.floor(Math.random() * playerIds.length)]
        }
        let tx = players[enemys[i].stalk].x - enemys[i].x,
          ty = players[enemys[i].stalk].y - enemys[i].y
        dist = Math.sqrt(tx * tx + ty * ty);

        if (dist > 10)
        {
          enemys[i].y = enemys[i].y + enemys[i].spd * ty / dist;
          enemys[i].x = enemys[i].x + enemys[i].spd * tx / dist;
        }
      }

    }
    else if (enemys[i].ai == 2)
    {
      if (enemys[i].hitDes)
      {
        enemys[i].tx = Math.floor(Math.random() * 600)
        enemys[i].ty = Math.floor(Math.random() * 600)
        enemys[i].hitDes = false;
      }
      let tx = enemys[i].tx - enemys[i].x,
        ty = enemys[i].ty - enemys[i].y
      dist = Math.sqrt(tx * tx + ty * ty);

      if (dist > 10)
      {
        enemys[i].y = enemys[i].y + enemys[i].spd * ty / dist;
        enemys[i].x = enemys[i].x + enemys[i].spd * tx / dist;
      }
      else
      {
        enemys[i].hitDes = true;
      }
    }
    for (let j = 0; j < playerIds.length; j++)
    {
      if (10 > Math.sqrt((players[playerIds[j]].x - enemys[i].x) * (players[playerIds[j]].x - enemys[i].x) + (players[playerIds[j]].y - enemys[i].y) * (players[playerIds[j]].y - enemys[i].y)))
      {
        players[playerIds[j]].color = "rgb(200,25,25)";
        dead.push({x: players[playerIds[j]].x,
                  y: players[playerIds[j]].y,
                }
                )
      }
    }
  }
}

setInterval(function()
{
  updateEnemies();
}, 1000 / 30);
