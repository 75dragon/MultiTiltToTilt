let socket = io();
let movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65:
      movement.left = true;
      break;
    case 87:
      movement.up = true;
      break;
    case 68:
      movement.right = true;
      break;
    case 83:
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65:
      movement.left = false;
      break;
    case 87:
      movement.up = false;
      break;
    case 68:
      movement.right = false;
      break;
    case 83:
      movement.down = false;
      break;
  }
});

socket.emit('new player!')

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60)

let canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
let context = canvas.getContext('2d');
socket.on('playerState', function(players) {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'black';
  for (let id in players) {
    let player = players[id];
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
    context.fillText(player.name, player.x, player.y + 15)
  }
});

socket.on('enemyState', function(enemys) {
  context.fillStyle = 'black';
  let bleh = 0;
  for (let id in enemys) {
    let enemy = enemys[bleh];
    console.log(bleh);
    bleh++;
    context.beginPath();
    context.arc(enemy.x, enemy.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});

let submitButton = document.getElementById('submit')
let inputBox = document.getElementById('inputBox')

submitButton.addEventListener('click', function(event) {
  event.preventDefault();
  socket.emit('setName', inputBox.value)
})

inputBox.addEventListener('keyup', function(event) {
  if (event.keyCode == 13) {
    event.preventDefault();
    socket.emit('setName', inputBox.value);
  }
})
