io = require('socket.io-client')
const readline = require('readline');
secret_code = '12345678'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

socket = io.connect("http://176.193.213.162:8888")
socket.on('res', (data) => {console.log(data)})
socket.on('bal', (data) => {console.log(data)})
socket.on('buyer', (data) => {console.log(data)})
audata = {login: "cheater", password: "cheats"}
socket.emit('auth', {auth: audata})

rl.on('line', (input) => {
  command = input.split(' ')
  if (command[0] == 'click') {
    console.log(`CLICK ${command[1]}`)
    for (let i = 1; i <= Number(command[1]); i++) {
      socket.emit('click', {auth: audata})
    }
  } else if (command[0] == "buy") {
    for (let i = 1; i <= Number(command[2]); i++) {
      socket.emit('buy', {itemname: command[1], auth: audata})
    }
  }
  else if (command[0] == 'backup') {
    socket.emit('back', {secret_code: secret_code})
  }
})