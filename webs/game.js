let canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
let context = canvas.getContext('2d');

let players = {};
let enemys = [];
let dead = [];


socket.on('playerState', function(playersrec)
{
  for (let id in playersrec)
  {
    let player = playersrec[id];
    players[id] = player;
  }
});

socket.on('enemyState', function(enemysrec)
{
  enemys = enemysrec;
});

socket.on('deadPlayers', function(deaded)
{
  dead = deaded;
})

let submitButton = document.getElementById('submit')
let inputBox = document.getElementById('inputBox')

submitButton.addEventListener('click', function(event)
{
  event.preventDefault();
  socket.emit('setName', inputBox.value)
})

inputBox.addEventListener('keyup', function(event)
{
  if (event.keyCode == 13)
  {
    event.preventDefault();
    socket.emit('setName', inputBox.value);
  }
})

setInterval(function()
{
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'black';
  context.strokeRect(0, 0, 800, 600);
  for (let id in players)
  {
    let player = players[id];
    context.fillStyle = player.color;
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
    context.fillText(player.name, player.x, player.y + 15)
  }
  let bleh = 0;
  while (bleh < enemys.length)
  {
    let enemy = enemys[bleh];
    bleh++;
    context.fillStyle = enemy.color;
    context.beginPath();
    context.arc(enemy.x, enemy.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
  bleh = 0;
  while (bleh < dead.length)
  {
    context.fillStyle = "red"
    let enemy = dead[bleh];
    bleh++;
    context.beginPath();
    context.moveTo(enemy.x - 20, enemy.y - 20);
    context.lineTo(enemy.x + 20, enemy.y + 20);
    context.moveTo(enemy.x + 20, enemy.y - 20);
    context.lineTo(enemy.x - 20, enemy.y + 20);
    context.stroke();
  }
}, 1000 / 60)
