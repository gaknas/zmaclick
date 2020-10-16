var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var fs = require('fs')

server.listen(8888)

design_folder = '/html/'

secret_code = '12345678'

app.use('/css', express.static(`${__dirname}/css`))

app.use('/js', express.static(`${__dirname}/js`))

app.use('/static', express.static(`${__dirname}/static`))

app.get('/', function(req, res) {
    res.sendFile(html_path('/game.html'))
})

app.get('/register', function(req, res) {
    res.sendFile(html_path('/index.html'))
})

app.get('/top', function(req, res) {
    res.sendFile(html_path('/top.html'))
})

app.get('/shop', function(req, res) {
    res.sendFile(html_path('/magaz.html'))
})

app.get('/transfer', function(req, res) {
    res.sendFile(html_path('/transfer.html'))
})

users_data = fs.readFileSync('./secret_folder/base.json', 'utf-8')
users = JSON.parse(users_data)
items = {pistol: {price: 10, desc: 1}, revolver: {price: 15, desc: 2}}
top = []
connections = []

function check(login, password) {
    usrdata = users[login]
    return (usrdata.password == password)
}

function html_path(filename) {
    return __dirname + '/' + design_folder + '/' + filename
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function updatetop() {
    console.log('updating_top')
    i = 0
    for (user in users) {
        top[i] = {username: user, balance: users[user].balance}
        i += 1
    }
    top.length = i
    top = sort(top)
    for (i in connections) {
        connections[i].emit('info', top)
    }
}

function sort(arr) {
    return arr.sort((a, b) => b.balance - a.balance)
}

setInterval(updatetop, 60000)

updatetop()

var backup = function() {
    if (!process.flagExit) {
      process.flagExit = true;
      console.log("BACKUP")
        fs.writeFileSync("./secret_folder/base.json", JSON.stringify(users))
    }
};

process.on('exit', backup);
process.on('SIGINT', backup)
process.on('SIGTERM', backup)

io.sockets.on('connection', function(socket) {
    connections.push(socket)
    console.log('ПОДКЛЮЧЕНИЕ')
    console.log(socket.handshake.address)

    socket.on('click', function(data) {
        console.log("CLICK", data)
        if (!data) {
            console.log('no data')
        }
        else if (!('auth' in data)) {
            console.log('no auth')
        }
        else {
            login = data.auth.login
            password = data.auth.password
            if (login in users) {
                if (check(login, password)) {
                    users[login].balance += 1
                    for (module in users[login].modules) {
                        users[login].balance += (items[module].desc * users[login].modules[module])
                    }
                    socket.emit('bal', {data: users[login].balance, res: 1})
                }
                else {
                    socket.emit('bal', {data: "WRONG PASSWORD", res: 2})
                }
            }
            else {
                socket.emit('bal', {data: "ACCOUNT NOT FOUND", res: 3})
            }
        }
    })

    socket.on('auth', function(data) {
        console.log("AUTH", data)
        if (!data) {
            console.log('no data')
        }
        else if (!('auth' in data)) {
            console.log('no auth')
        }
        else  if (!('login' in data.auth) || !('password' in data.auth)) {
            console.log('not enough data')
        }
        else {
            login = data.auth.login
            password = data.auth.password
            if (login in users) {
                if (check(login, password)) {
                    console.log('ready')
                    usrdata = users[login]
                    socket.emit('res', {result: "auth_ready", balance: usrdata.balance, modules: users[login].modules, code: 1})
                }
                else {
                    console.log('wrong password')
                    socket.emit('res', {result: "WRONG PASSWORD", balance: 0, code: 0})
                }
            }
            else {
                console.log('registration')
                users[login] = {password: password, balance: 0, modules: {}}
                socket.emit('res', {result: "reg_comp", balance: 0, modules: {}, code: 1})
            }
        }
    })

    socket.on('buy', function(data) {
        console.log("BUY", data)
        if (!data) {
            console.log('no data')
        }
        else if (!('auth' in data)) {
            console.log('no auth')
        }
        else {
            login = data.auth.login
            password = data.auth.password
            if (login in users) {
                if (check(login, password)) {
                    if (!(data.itemname in users[login].modules)) {
                        users[login].modules[data.itemname] = 0
                    }
                    nullprice = items[data.itemname].price
                    realprice = nullprice * Math.pow(1.2, users[login].modules[data.itemname])
                    realprice = Math.round(realprice)
                    if (users[login].balance >= realprice) {
                        users[login].balance -= realprice
                        users[login].modules[data.itemname] += 1
                        socket.emit('buyer', {res: 1, realprice: realprice, itemname: data.itemname, balance: users[login].balance, modules: users[login].modules})
                    }
                    else {
                        socket.emit('buyer', {data: "NOT ENOUGH MONEY", res: 4})
                    }
                }
                else {
                    socket.emit('buyer', {data: "WRONG PASSWORD", res: 2})
                }
            }
            else {
                socket.emit('buyer', {data: "ACCOUNT NOT FOUND", res: 3})
            }
        }
    })

    socket.on('transfer', function(data) {
        console.log("TRANSFER", data)
        if (!data) {
            console.log('no data')
        }
        else if (!('auth' in data)) {
            console.log('no auth')
        }
        else if (!('target' in data)) {
            console.log('no target')
        }
        else if (!(data["target"] in users)) {
            console.log('wrong target')
            socket.emit('tresult', {data: "WRONG TARGET", res: 5})
        }
        else if (!('amount' in data)) {
            console.log('no amount')
        }
        else {
            login = data.auth.login
            password = data.auth.password
            target = data.target
            amount = data.amount
            if (login in users) {
                if (check(login, password)) {
                    if (users[login].balance >= amount) {
                        users[login].balance -= Number(amount)
                        users[target].balance += Number(amount)
                        socket.emit('tresult', {res: 1, balance: users[login].balance})
                    }
                    else {
                        socket.emit('tresult', {data: "NOT ENOUGH MONEY", res: 4})
                    }
                }
                else {
                    socket.emit('tresult', {data: "WRONG PASSWORD", res: 2})
                }
            }
            else {
                socket.emit('tresult', {data: "ACCOUNT NOT FOUND", res: 3})
            }
        }
    })

    socket.on('get_users', function(data) {
        socket.emit('info', top)
    })

    socket.on('get_items', function(data) {
        ritems = {}
        for (itemname in items) {
            nullprice = items[itemname].price
            if (!(itemname in users[login].modules)) {
                users[login].modules[itemname] = 0
            }
            realprice = nullprice * Math.pow(1.2, users[login].modules[itemname])
            realprice = Math.round(realprice)
            ritems[itemname] = {price: realprice, desc: items[itemname].desc}
        }
        socket.emit('list', ritems)
    })

    socket.on('back', function(data) {
        console.log("BACK", data)
        if (data && 'secret_code' in data) {
            if (data['secret_code'] == secret_code) {
                backup()
            }
            else {
                console.log('!!!WRONG CODE!!!')
            }
        }
        else {
            console.log('sombudy trying to call_back')
        }
    })

    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1)
        console.log('ОТКЛЮЧЕНИЕ')
    })
})